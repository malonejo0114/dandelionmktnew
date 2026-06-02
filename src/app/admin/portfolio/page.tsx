import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteCase, togglePublished, reorderCase } from "@/app/admin/actions";

type ListRow = { id: string; slug: string; title: string; industry: string; published: boolean; sort_order: number };

export default async function AdminPortfolioList() {
  const supabase = getSupabaseAdmin();
  let rows: ListRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("portfolio_cases")
      .select("id,slug,title,industry,published,sort_order")
      .order("sort_order", { ascending: true });
    rows = (data as ListRow[]) ?? [];
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-kr text-2xl font-bold">포트폴리오</h1>
        <Link href="/admin/portfolio/new" className="bg-[#D6B77A] px-5 py-2.5 font-display text-xs uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0]">
          새 케이스
        </Link>
      </div>

      {!supabase ? (
        <p className="mt-8 font-kr text-sm text-[#D96C63]">Supabase 환경변수가 설정되지 않았습니다. .env.local을 설정해주세요.</p>
      ) : (
        <div className="mt-8 grid gap-px bg-[#343437]">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_auto] items-center gap-4 bg-[#111214] p-4">
              <div>
                <p className="font-kr font-medium text-[#F4EFE5]">{row.title}</p>
                <p className="font-display text-xs uppercase tracking-[0.2em] text-[#8B8B86]">
                  {row.industry} · {row.slug} {row.published ? "" : "· 미게시"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={reorderCase.bind(null, row.id, "up")}><button className="px-2 text-[#8B8B86] hover:text-[#D6B77A]">↑</button></form>
                <form action={reorderCase.bind(null, row.id, "down")}><button className="px-2 text-[#8B8B86] hover:text-[#D6B77A]">↓</button></form>
                <form action={togglePublished.bind(null, row.id)}>
                  <button className="px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-[#8B8B86] hover:text-[#D6B77A]">
                    {row.published ? "숨기기" : "게시"}
                  </button>
                </form>
                <Link href={`/admin/portfolio/${row.id}`} className="px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-[#D6B77A]">수정</Link>
                <form action={deleteCase.bind(null, row.id)}>
                  <button className="px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-[#D96C63] hover:underline">삭제</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
