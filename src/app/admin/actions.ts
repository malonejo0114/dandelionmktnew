"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAllowedAdmin, getAdminEmail } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SiteContent } from "@/data/content";

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

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function parseSiteContent(formData: FormData): SiteContent {
  const lines = (key: string) =>
    str(formData, key).split("\n").map((s) => s.trim()).filter(Boolean);
  const keywords = [0, 1, 2, 3].map((i) => ({
    kr: str(formData, `hero_kw_kr_${i}`),
    en: str(formData, `hero_kw_en_${i}`),
  }));
  const items = [0, 1, 2, 3].map((i) => ({
    code: str(formData, `fw_code_${i}`),
    title: str(formData, `fw_title_${i}`),
    body: str(formData, `fw_body_${i}`),
  }));
  const proofs = [0, 1, 2, 3].map((i) => str(formData, `about_proof_${i}`));
  const nav = [0, 1, 2, 3].map((i) => ({
    label: str(formData, `nav_label_${i}`),
    href: str(formData, `nav_href_${i}`),
  }));
  return {
    hero: {
      agencyTag: str(formData, "hero_agencyTag"),
      overline: str(formData, "hero_overline"),
      headPrefix: str(formData, "hero_headPrefix"),
      keywords,
      keywordSuffix: str(formData, "hero_keywordSuffix"),
      headSuffix: str(formData, "hero_headSuffix"),
      support: str(formData, "hero_support"),
      ctaPrimaryLabel: str(formData, "hero_ctaPrimaryLabel"),
      ctaPrimaryHref: str(formData, "hero_ctaPrimaryHref"),
      ctaSecondaryLabel: str(formData, "hero_ctaSecondaryLabel"),
      ctaSecondaryHref: str(formData, "hero_ctaSecondaryHref"),
    },
    about: {
      label: str(formData, "about_label"),
      headline: str(formData, "about_headline"),
      headlineAccent: str(formData, "about_headlineAccent"),
      lead: str(formData, "about_lead"),
      body: str(formData, "about_body"),
      proofs,
    },
    framework: {
      label: str(formData, "fw_label"),
      title: str(formData, "fw_title"),
      items,
    },
    portfolio: {
      label: str(formData, "pf_label"),
      headline: str(formData, "pf_headline"),
      description: str(formData, "pf_description"),
    },
    cta: {
      label: str(formData, "cta_label"),
      headline: str(formData, "cta_headline"),
      description: str(formData, "cta_description"),
      compliance: lines("cta_compliance"),
    },
    seo: {
      title: str(formData, "seo_title"),
      titleTemplate: str(formData, "seo_titleTemplate"),
      description: str(formData, "seo_description"),
      ogTitle: str(formData, "seo_ogTitle"),
      ogDescription: str(formData, "seo_ogDescription"),
    },
    common: {
      brandName: str(formData, "common_brandName"),
      corpName: str(formData, "common_corpName"),
      contactLabel: str(formData, "common_contactLabel"),
      mobileCtaLabel: str(formData, "common_mobileCtaLabel"),
      nav,
      marqueeWords: lines("common_marqueeWords"),
      footerTagline: str(formData, "common_footerTagline"),
      kakaoUrl: str(formData, "common_kakaoUrl"),
      youtubeUrl: str(formData, "common_youtubeUrl"),
    },
  };
}

export async function deleteLead(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}

export async function updateSiteContent(formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const content = parseSiteContent(formData);
  const { error } = await supabase
    .from("site_content")
    .upsert({ id: "singleton", content });
  if (error) throw new Error(`저장 실패: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content");
}

// === Blog ===
export async function createBlogUploadUrl(slugOrTmp: string, kind: string, ext: string): Promise<SignedUpload> {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "supabase not configured" };
  const safe = (slugOrTmp || "post").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase() || "post";
  const safeKind = (kind || "img").replace(/[^a-z0-9]/gi, "").toLowerCase() || "img";
  const safeExt = (ext || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `posts/${safe}/${safeKind}-${Date.now()}.${safeExt}`;
  const { data, error } = await supabase.storage.from("blog-media").createSignedUploadUrl(path);
  if (error || !data) return { error: "업로드 URL 생성 실패." };
  return { path: data.path, token: data.token };
}

function parsePostForm(formData: FormData) {
  const qs = formData.getAll("faq_q").map(String);
  const as = formData.getAll("faq_a").map(String);
  const faqs = qs.map((q, i) => ({ q: q.trim(), a: (as[i] ?? "").trim() })).filter((f) => f.q || f.a);
  const status = formData.get("status") === "published" ? "published" : "draft";
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  return {
    slug: s("slug"),
    title: s("title"),
    category: s("category") || "Marketing",
    status,
    excerpt: s("excerpt"),
    cover_url: s("cover_url") || null,
    cover_video_url: s("cover_video_url") || null,
    content_html: String(formData.get("content_html") ?? ""),
    summary: s("summary"),
    faqs,
    seo_title: s("seo_title"),
    seo_description: s("seo_description"),
    reading_time: s("reading_time") || "5 min read",
  };
}

export async function createPost(formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const p = parsePostForm(formData);
  if (!p.slug || !p.title) throw new Error("slug/title required");
  const published_at = p.status === "published" ? new Date().toISOString() : null;
  const { error } = await supabase.from("posts").insert({ ...p, published_at });
  if (error) throw new Error(`저장 실패: ${error.message}`);
  revalidatePath("/"); revalidatePath("/blog"); revalidatePath("/blog/[slug]", "page"); revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const p = parsePostForm(formData);
  const { data: cur } = await supabase.from("posts").select("status,published_at").eq("id", id).maybeSingle();
  let published_at = cur?.published_at ?? null;
  if (p.status === "published" && !published_at) published_at = new Date().toISOString();
  if (p.status !== "published") published_at = null;
  const { error } = await supabase.from("posts").update({ ...p, published_at }).eq("id", id);
  if (error) throw new Error(`수정 실패: ${error.message}`);
  revalidatePath("/"); revalidatePath("/blog"); revalidatePath("/blog/[slug]", "page"); revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/"); revalidatePath("/blog"); revalidatePath("/blog/[slug]", "page"); revalidatePath("/admin/blog");
}

export async function togglePostStatus(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const { data } = await supabase.from("posts").select("status,published_at").eq("id", id).maybeSingle();
  const next = data?.status === "published" ? "draft" : "published";
  const published_at = next === "published" ? (data?.published_at ?? new Date().toISOString()) : null;
  await supabase.from("posts").update({ status: next, published_at }).eq("id", id);
  revalidatePath("/"); revalidatePath("/blog"); revalidatePath("/blog/[slug]", "page"); revalidatePath("/admin/blog");
}

// === Tracking ===
export async function createTrackingLink(formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const label = String(formData.get("label") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
  if (!code) throw new Error("code required");
  const { error } = await supabase.from("tracking_links").insert({ code, label });
  if (error) throw new Error(`생성 실패: ${error.message}`);
  revalidatePath("/admin/analytics");
}

export async function deleteTrackingLink(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("tracking_links").delete().eq("id", id);
  revalidatePath("/admin/analytics");
}
