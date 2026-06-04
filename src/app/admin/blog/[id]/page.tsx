import { notFound } from "next/navigation";
import { PostEditor, type PostFormValues } from "@/components/admin/post-editor";
import { updatePost } from "@/app/admin/actions";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Faq } from "@/lib/posts";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const initial: PostFormValues = {
    slug: data.slug, title: data.title, category: data.category, status: data.status,
    excerpt: data.excerpt ?? "", coverUrl: data.cover_url ?? "", coverVideoUrl: data.cover_video_url ?? "", contentHtml: data.content_html ?? "",
    summary: data.summary ?? "", faqs: (Array.isArray(data.faqs) ? data.faqs : []) as Faq[],
    seoTitle: data.seo_title ?? "", seoDescription: data.seo_description ?? "", readingTime: data.reading_time ?? "5 min read",
  };
  const action = updatePost.bind(null, id);
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">글 수정 — {data.title}</h1>
      <PostEditor action={action} initial={initial} />
    </div>
  );
}
