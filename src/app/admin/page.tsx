import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";

export default async function AdminDashboard() {
  const supabase = getSupabaseAdmin();
  let total = 0;
  let unpublished = 0;
  let leadCount = 0;
  if (supabase) {
    const { data } = await supabase.from("portfolio_cases").select("published");
    total = data?.length ?? 0;
    unpublished = data?.filter((r) => !r.published).length ?? 0;
    const { count } = await supabase.from("leads").select("id", { count: "exact", head: true });
    leadCount = count ?? 0;
  }
  return (
    <div>
      <h1 className="font-kr text-2xl font-bold">대시보드</h1>
      <div className="mt-8 grid grid-cols-2 gap-px bg-[#343437] sm:grid-cols-3">
        <div className="bg-[#111214] p-6">
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[#8B8B86]">Cases</p>
          <p className="mt-2 font-display text-4xl text-[#D6B77A]">{total}</p>
        </div>
        <div className="bg-[#111214] p-6">
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[#8B8B86]">미게시</p>
          <p className="mt-2 font-display text-4xl text-[#F4EFE5]">{unpublished}</p>
        </div>
        <div className="bg-[#111214] p-6">
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[#8B8B86]">문의</p>
          <p className="mt-2 font-display text-4xl text-[#D6B77A]">{leadCount}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/portfolio" className="inline-block border border-[#D6B77A] px-6 py-3 font-display text-xs uppercase tracking-[0.18em] text-[#D6B77A] hover:bg-[#D6B77A] hover:text-[#111214]">
          포트폴리오 관리 →
        </Link>
        <Link href="/admin/content" className="inline-block border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.18em] text-[#F4EFE5] hover:border-[#D6B77A]">
          콘텐츠 편집 →
        </Link>
        <Link href="/admin/leads" className="inline-block border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.18em] text-[#F4EFE5] hover:border-[#D6B77A]">
          문의함 →
        </Link>
        <Link href="/admin/blog" className="inline-block border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.18em] text-[#F4EFE5] hover:border-[#D6B77A]">
          블로그 →
        </Link>
        <Link href="/admin/analytics" className="inline-block border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.18em] text-[#F4EFE5] hover:border-[#D6B77A]">
          분석 →
        </Link>
      </div>
    </div>
  );
}
