import { notFound } from "next/navigation";
import { CaseEditor, type CaseFormValues } from "@/components/admin/case-editor";
import { updateCase } from "@/app/admin/actions";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { CaseDetailBlock } from "@/lib/portfolio";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();
  const { data } = await supabase.from("portfolio_cases").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const initial: CaseFormValues = {
    slug: data.slug, industry: data.industry, title: data.title, problem: data.problem,
    strategy: data.strategy, result: data.result, duration: data.duration, summary: data.summary ?? "",
    detail: (Array.isArray(data.detail) ? data.detail : []) as CaseDetailBlock[],
    published: data.published, sort_order: data.sort_order,
    video_url: data.video_url ?? "", poster_url: data.poster_url ?? "",
  };

  const action = updateCase.bind(null, id);
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">케이스 수정 — {data.title}</h1>
      <CaseEditor action={action} initial={initial} />
    </div>
  );
}
