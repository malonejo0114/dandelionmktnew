import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";

export default async function AdminDashboard() {
  const supabase = getSupabaseAdmin();
  let total = 0;
  let unpublished = 0;
  if (supabase) {
    const { data } = await supabase.from("portfolio_cases").select("published");
    total = data?.length ?? 0;
    unpublished = data?.filter((r) => !r.published).length ?? 0;
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
      </div>
      <Link href="/admin/portfolio" className="mt-8 inline-block border border-[#D6B77A] px-6 py-3 font-display text-xs uppercase tracking-[0.18em] text-[#D6B77A] hover:bg-[#D6B77A] hover:text-[#111214]">
        포트폴리오 관리 →
      </Link>
    </div>
  );
}
