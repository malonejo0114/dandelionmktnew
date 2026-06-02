import { getSupabaseAdmin } from "@/lib/supabase";
import { defaultContent, type SiteContent } from "@/data/content";

/** DB 단일 행(content jsonb)을 기본값 위에 섹션별로 머지. 미설정/오류 시 기본값. */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultContent;
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", "singleton")
    .maybeSingle();
  if (error || !data?.content) return defaultContent;
  const c = data.content as Partial<SiteContent>;
  return {
    hero: { ...defaultContent.hero, ...(c.hero ?? {}) },
    about: { ...defaultContent.about, ...(c.about ?? {}) },
    framework: { ...defaultContent.framework, ...(c.framework ?? {}) },
    portfolio: { ...defaultContent.portfolio, ...(c.portfolio ?? {}) },
    cta: { ...defaultContent.cta, ...(c.cta ?? {}) },
    common: { ...defaultContent.common, ...(c.common ?? {}) },
  };
}
