import { getSupabaseAdmin } from "@/lib/supabase";
import { portfolioCases as staticCases } from "@/data/site";

export type CaseDetailBlock = { heading: string; body: string };
export type Case = {
  slug: string;
  industry: string;
  title: string;
  problem: string;
  strategy: string;
  result: string;
  duration: string;
  summary: string;
  detail: CaseDetailBlock[];
  video: string;
  poster: string;
};

const FALLBACK_VIDEO = "/hero.mp4";
const FALLBACK_POSTER = "/hero-poster.jpg";

function fromStatic(): Case[] {
  return staticCases.map((c) => ({
    slug: c.slug,
    industry: c.industry,
    title: c.title,
    problem: c.problem,
    strategy: c.strategy,
    result: c.result,
    duration: c.duration,
    summary: c.summary,
    detail: c.detail,
    video: c.video ?? FALLBACK_VIDEO,
    poster: c.poster ?? FALLBACK_POSTER,
  }));
}

type Row = {
  slug: string; industry: string; title: string; problem: string;
  strategy: string; result: string; duration: string; summary: string;
  detail: CaseDetailBlock[] | null; video_url: string | null; poster_url: string | null;
};

function fromRow(r: Row): Case {
  return {
    slug: r.slug,
    industry: r.industry,
    title: r.title,
    problem: r.problem,
    strategy: r.strategy,
    result: r.result,
    duration: r.duration,
    summary: r.summary,
    detail: Array.isArray(r.detail) ? r.detail : [],
    video: r.video_url || FALLBACK_VIDEO,
    poster: r.poster_url || FALLBACK_POSTER,
  };
}

/** 공개용: published 케이스를 sort_order 순으로. DB 미설정/에러/빈 결과면 정적 폴백. */
export async function getPublishedCases(): Promise<Case[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fromStatic();
  const { data, error } = await supabase
    .from("portfolio_cases")
    .select("slug,industry,title,problem,strategy,result,duration,summary,detail,video_url,poster_url")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return fromStatic();
  return (data as Row[]).map(fromRow);
}

export async function getCaseBySlug(slug: string): Promise<Case | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fromStatic().find((c) => c.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("portfolio_cases")
    .select("slug,industry,title,problem,strategy,result,duration,summary,detail,video_url,poster_url")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return fromStatic().find((c) => c.slug === slug) ?? null;
  return fromRow(data as Row);
}
