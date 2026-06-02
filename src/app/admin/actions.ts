"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAllowedAdmin, getAdminEmail } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export type AuthState = { status: "idle" | "error"; message: string };

export async function signInWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: "error", message: "이메일과 비밀번호를 입력해주세요." };
  if (!isAllowedAdmin(email)) {
    return { status: "error", message: "허용되지 않은 이메일입니다." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { status: "error", message: "로그인 실패 — 이메일 또는 비밀번호를 확인해주세요." };
  }
  redirect("/admin");
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

export type SignedUpload = { path: string; token: string } | { error: string };

/**
 * 브라우저 직접 업로드용 서명 URL 발급 (파일 본문이 서버를 거치지 않음 → Vercel 4.5MB 한도 회피).
 * 클라이언트는 반환된 path+token으로 storage.uploadToSignedUrl()을 호출한다.
 */
export async function createUploadUrl(slug: string, kind: string, ext: string): Promise<SignedUpload> {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "supabase not configured" };
  const safeSlug = (slug || "case").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase() || "case";
  const safeKind = kind === "video" ? "video" : "poster";
  const safeExt = (ext || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `cases/${safeSlug}/${safeKind}-${Date.now()}.${safeExt}`;
  const { data, error } = await supabase.storage.from("portfolio-media").createSignedUploadUrl(path);
  if (error || !data) return { error: "업로드 URL 생성 실패." };
  return { path: data.path, token: data.token };
}
