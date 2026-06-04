import { getSupabaseAdmin } from "@/lib/supabase";
import { createTrackingLink, deleteTrackingLink } from "@/app/admin/actions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dandelionmktnew.vercel.app";

type LinkRow = { id: string; code: string; label: string };

function countSince(rows: { created_at: string }[], ms: number) {
  const since = Date.now() - ms;
  return rows.filter((r) => new Date(r.created_at).getTime() >= since).length;
}
function countYear(rows: { created_at: string }[]) {
  const y = new Date().getFullYear();
  return rows.filter((r) => new Date(r.created_at).getFullYear() === y).length;
}

export default async function AdminAnalyticsPage() {
  const supabase = getSupabaseAdmin();
  let links: LinkRow[] = [];
  let visits: { code: string; created_at: string }[] = [];
  let leads: { ref: string | null; created_at: string }[] = [];
  if (supabase) {
    const [l, v, le] = await Promise.all([
      supabase.from("tracking_links").select("id,code,label").order("created_at", { ascending: false }),
      supabase.from("link_visits").select("code,created_at"),
      supabase.from("leads").select("ref,created_at"),
    ]);
    links = (l.data as LinkRow[]) ?? [];
    visits = (v.data as { code: string; created_at: string }[]) ?? [];
    leads = (le.data as { ref: string | null; created_at: string }[]) ?? [];
  }

  const DAY = 86400000;
  const tiles = [
    { k: "오늘 유입", v: countSince(visits, DAY) },
    { k: "7일 유입", v: countSince(visits, 7 * DAY) },
    { k: "30일 유입", v: countSince(visits, 30 * DAY) },
    { k: "올해 유입", v: countYear(visits) },
    { k: "오늘 문의", v: countSince(leads, DAY) },
    { k: "7일 문의", v: countSince(leads, 7 * DAY) },
    { k: "30일 문의", v: countSince(leads, 30 * DAY) },
    { k: "올해 문의", v: countYear(leads) },
  ];

  const perLink = links.map((link) => {
    const vCount = visits.filter((x) => x.code === link.code).length;
    const cCount = leads.filter((x) => x.ref === link.code).length;
    return { ...link, vCount, cCount, rate: vCount ? Math.round((cCount / vCount) * 100) : 0 };
  });

  return (
    <div>
      <h1 className="font-kr text-2xl font-bold">분석</h1>
      <p className="mt-2 font-kr text-sm text-[#8B8B86]">전체 방문자/페이지뷰는 Vercel 대시보드의 Analytics 탭에서 확인하세요. 아래는 트래킹 링크 유입·문의 전환입니다.</p>

      {!supabase ? (
        <p className="mt-8 font-kr text-sm text-[#D96C63]">Supabase 환경변수가 설정되지 않았습니다.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-px bg-[#343437] sm:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.k} className="bg-[#111214] p-5">
                <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[#8B8B86]">{t.k}</p>
                <p className="mt-2 font-display text-3xl text-[#D6B77A]">{t.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="font-kr text-lg font-bold">트래킹 링크</h2>
            <form action={createTrackingLink} className="mt-4 flex flex-wrap items-end gap-3">
              <label className="grid gap-1.5">
                <span className="font-display text-[10px] uppercase tracking-[0.2em] text-[#8B8B86]">코드(영문/숫자)</span>
                <input name="code" required placeholder="kakao_0602" className="h-10 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
              </label>
              <label className="grid gap-1.5">
                <span className="font-display text-[10px] uppercase tracking-[0.2em] text-[#8B8B86]">라벨(설명)</span>
                <input name="label" placeholder="카카오 채널 6월" className="h-10 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
              </label>
              <button type="submit" className="h-10 bg-[#D6B77A] px-5 font-display text-xs uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0]">링크 생성</button>
            </form>

            <div className="mt-6 grid gap-px bg-[#343437]">
              {perLink.map((row) => (
                <div key={row.id} className="grid gap-2 bg-[#111214] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-kr font-medium text-[#F4EFE5]">{row.label || row.code}</p>
                      <p className="select-all font-kr text-xs text-[#8B8B86]">{`${siteUrl}/?ref=${row.code}`}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right"><p className="font-display text-[10px] uppercase tracking-[0.18em] text-[#8B8B86]">유입</p><p className="font-display text-xl text-[#F4EFE5]">{row.vCount}</p></div>
                      <div className="text-right"><p className="font-display text-[10px] uppercase tracking-[0.18em] text-[#8B8B86]">문의</p><p className="font-display text-xl text-[#D6B77A]">{row.cCount}</p></div>
                      <div className="text-right"><p className="font-display text-[10px] uppercase tracking-[0.18em] text-[#8B8B86]">전환율</p><p className="font-display text-xl text-[#F4EFE5]">{row.rate}%</p></div>
                      <form action={deleteTrackingLink.bind(null, row.id)}>
                        <button className="font-display text-[10px] uppercase tracking-[0.16em] text-[#D96C63] hover:underline">삭제</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
