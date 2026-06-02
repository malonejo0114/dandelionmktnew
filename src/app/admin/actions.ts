"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAllowedAdmin, getAdminEmail } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export type AuthState = { status: "idle" | "sent" | "error"; message: string };

export async function requestMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { status: "error", message: "이메일을 입력해주세요." };
  if (!isAllowedAdmin(email)) {
    return { status: "error", message: "허용되지 않은 이메일입니다." };
  }
  const supabase = await createSupabaseServerClient();
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/admin` },
  });
  if (error) return { status: "error", message: "발송 실패. 잠시 후 다시 시도해주세요." };
  return { status: "sent", message: "로그인 링크를 이메일로 보냈습니다. 메일함을 확인해주세요." };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function assertAdmin() {
  const email = await getAdminEmail();
  if (!email) throw new Error("unauthorized");
}

export async function togglePublished(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const { data } = await supabase.from("portfolio_cases").select("published").eq("id", id).maybeSingle();
  await supabase.from("portfolio_cases").update({ published: !data?.published }).eq("id", id);
  revalidatePath("/"); revalidatePath("/portfolio/[slug]", "page"); revalidatePath("/admin/portfolio");
}

export async function deleteCase(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("portfolio_cases").delete().eq("id", id);
  revalidatePath("/"); revalidatePath("/portfolio/[slug]", "page"); revalidatePath("/admin/portfolio");
}

export async function reorderCase(id: string, dir: "up" | "down") {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const { data: all } = await supabase.from("portfolio_cases").select("id,sort_order").order("sort_order", { ascending: true });
  if (!all) return;
  const idx = all.findIndex((r) => r.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return;
  const a = all[idx], b = all[swapIdx];
  await supabase.from("portfolio_cases").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("portfolio_cases").update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath("/"); revalidatePath("/portfolio/[slug]", "page"); revalidatePath("/admin/portfolio");
}

function parseCaseForm(formData: FormData) {
  const headings = formData.getAll("detail_heading").map(String);
  const bodies = formData.getAll("detail_body").map(String);
  const detail = headings
    .map((heading, i) => ({ heading: heading.trim(), body: (bodies[i] ?? "").trim() }))
    .filter((d) => d.heading || d.body);
  const num = (v: FormDataEntryValue | null) => Number(String(v ?? "0")) || 0;
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    industry: String(formData.get("industry") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    problem: String(formData.get("problem") ?? "").trim(),
    strategy: String(formData.get("strategy") ?? "").trim(),
    result: String(formData.get("result") ?? "").trim(),
    duration: String(formData.get("duration") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    detail,
    published: formData.get("published") === "on",
    sort_order: num(formData.get("sort_order")),
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    poster_url: String(formData.get("poster_url") ?? "").trim() || null,
  };
}

export async function createCase(formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const payload = parseCaseForm(formData);
  if (!payload.slug || !payload.title) throw new Error("slug/title required");
  const { error } = await supabase.from("portfolio_cases").insert(payload);
  if (error) throw new Error(`저장 실패: ${error.message}`);
  revalidatePath("/"); revalidatePath(`/portfolio/${payload.slug}`); revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export async function updateCase(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const payload = parseCaseForm(formData);
  const { error } = await supabase.from("portfolio_cases").update(payload).eq("id", id);
  if (error) throw new Error(`수정 실패: ${error.message}`);
  revalidatePath("/"); revalidatePath(`/portfolio/${payload.slug}`); revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export type UploadResult = { url: string } | { error: string };

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "supabase not configured" };
  const file = formData.get("file") as File | null;
  const slug = String(formData.get("slug") ?? "case").trim() || "case";
  const kind = String(formData.get("kind") ?? "media"); // "video" | "poster"
  if (!file || file.size === 0) return { error: "파일이 없습니다." };
  const maxBytes = kind === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) return { error: "파일이 너무 큽니다." };
  const allowedTypes = kind === "video"
    ? ["video/mp4", "video/webm", "video/quicktime"]
    : ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "지원하지 않는 파일 형식입니다." };
  }
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const path = `cases/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("portfolio-media")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) return { error: "업로드 실패." };
  const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
  return { url: data.publicUrl };
}
