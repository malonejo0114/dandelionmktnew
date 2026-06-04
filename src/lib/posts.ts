import { getSupabaseAdmin } from "@/lib/supabase";
import { getAllPosts as getMdxPosts, getPostBySlug as getMdxPost } from "@/lib/blog";

export type Faq = { q: string; a: string };
export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverUrl: string | null;
  coverVideoUrl: string | null;
  contentHtml: string;
  summary: string;
  faqs: Faq[];
  seoTitle: string;
  seoDescription: string;
  readingTime: string;
  publishedAt: string | null;
  isMarkdown?: boolean;
};

type Row = {
  slug: string; title: string; category: string; excerpt: string;
  cover_url: string | null; cover_video_url: string | null; content_html: string; summary: string;
  faqs: Faq[] | null; seo_title: string; seo_description: string;
  reading_time: string; published_at: string | null;
};

function fromRow(r: Row): Post {
  return {
    slug: r.slug, title: r.title, category: r.category, excerpt: r.excerpt,
    coverUrl: r.cover_url, coverVideoUrl: r.cover_video_url, contentHtml: r.content_html, summary: r.summary,
    faqs: Array.isArray(r.faqs) ? r.faqs : [],
    seoTitle: r.seo_title, seoDescription: r.seo_description,
    readingTime: r.reading_time, publishedAt: r.published_at,
  };
}

function fromMdx(p: { slug: string; title: string; description: string; category: string; date: string; readingTime: string; content: string }): Post {
  return {
    slug: p.slug, title: p.title, category: p.category, excerpt: p.description,
    coverUrl: null, coverVideoUrl: null, contentHtml: p.content, summary: "", faqs: [],
    seoTitle: p.title, seoDescription: p.description, readingTime: p.readingTime,
    publishedAt: p.date, isMarkdown: true,
  };
}

const COLS = "slug,title,category,excerpt,cover_url,cover_video_url,content_html,summary,faqs,seo_title,seo_description,reading_time,published_at";

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return getMdxPosts().map(fromMdx);
  const { data, error } = await supabase
    .from("posts").select(COLS).eq("status", "published").order("published_at", { ascending: false });
  if (error || !data || data.length === 0) return getMdxPosts().map(fromMdx);
  return (data as Row[]).map(fromRow);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) { const p = getMdxPost(slug); return p ? fromMdx(p) : null; }
  const { data, error } = await supabase
    .from("posts").select(COLS).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error || !data) { const p = getMdxPost(slug); return p ? fromMdx(p) : null; }
  return fromRow(data as Row);
}
