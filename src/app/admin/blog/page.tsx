import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { deletePost, togglePostStatus } from "@/app/admin/actions";

type Row = { id: string; slug: string; title: string; category: string; status: string; published_at: string | null };

export default async function AdminBlogList() {
  const supabase = getSupabaseAdmin();
  let rows: Row[] = [];
  if (supabase) {
    const { data } = await supabase.from("posts").select("id,slug,title,category,status,published_at").order("created_at", { ascending: false });
    rows = (data as Row[]) ?? [];
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-kr text-2xl font-bold">블로그</h1>
        <Link href="/admin/blog/new" className="bg-[#D6B77A] px-5 py-2.5 font-display text-xs uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0]">새 글</Link>
      </div>
      {!supabase ? (
        <p className="mt-8 font-kr text-sm text-[#D96C63]">Supabase 환경변수가 설정되지 않았습니다.</p>
      ) : (
        <div className="mt-8 grid gap-px bg-[#343437]">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_auto] items-center gap-4 bg-[#111214] p-4">
              <div>
                <p className="font-kr font-medium text-[#F4EFE5]">{row.title}</p>
                <p className="font-display text-xs uppercase tracking-[0.2em] text-[#8B8B86]">
                  {row.category} · {row.slug} · {row.status === "published" ? "게시" : "임시"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={togglePostStatus.bind(null, row.id)}>
                  <button className="px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-[#8B8B86] hover:text-[#D6B77A]">
                    {row.status === "published" ? "숨기기" : "게시"}
                  </button>
                </form>
                <Link href={`/admin/blog/${row.id}`} className="px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-[#D6B77A]">수정</Link>
                <form action={deletePost.bind(null, row.id)}>
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
