import { getSupabaseAdmin } from "@/lib/supabase";
import { deleteLead } from "@/app/admin/actions";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  industry: string;
  channel: string | null;
  challenge: string;
  marketing_consent: boolean;
};

export default async function AdminLeadsPage() {
  const supabase = getSupabaseAdmin();
  let leads: Lead[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("leads")
      .select("id,created_at,name,phone,email,industry,channel,challenge,marketing_consent")
      .order("created_at", { ascending: false });
    leads = (data as Lead[]) ?? [];
  }

  return (
    <div>
      <h1 className="font-kr text-2xl font-bold">문의함</h1>
      <p className="mt-2 font-kr text-sm text-[#8B8B86]">총 {leads.length}건</p>

      {!supabase ? (
        <p className="mt-8 font-kr text-sm text-[#D96C63]">Supabase 환경변수가 설정되지 않았습니다.</p>
      ) : leads.length === 0 ? (
        <p className="mt-8 font-kr text-sm text-[#8B8B86]">아직 문의가 없습니다.</p>
      ) : (
        <div className="mt-8 grid gap-px bg-[#343437]">
          {leads.map((lead) => (
            <article key={lead.id} className="grid gap-4 bg-[#111214] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-kr text-lg font-medium text-[#F4EFE5]">
                    {lead.name} <span className="text-[#8B8B86]">· {lead.industry}</span>
                  </p>
                  <p className="font-display text-xs uppercase tracking-[0.18em] text-[#8B8B86]">
                    {new Date(lead.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <form action={deleteLead.bind(null, lead.id)}>
                  <button className="border border-[#343437] px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.16em] text-[#D96C63] hover:border-[#D96C63]">
                    삭제
                  </button>
                </form>
              </div>
              <div className="grid gap-2 font-kr text-sm text-[#CFC8BC] sm:grid-cols-2">
                <p><span className="text-[#8B8B86]">연락처</span> {lead.phone}</p>
                <p><span className="text-[#8B8B86]">이메일</span> {lead.email || "—"}</p>
                <p><span className="text-[#8B8B86]">운영 채널</span> {lead.channel || "—"}</p>
                <p><span className="text-[#8B8B86]">마케팅 동의</span> {lead.marketing_consent ? "동의" : "미동의"}</p>
              </div>
              <p className="border-l border-[#D6B77A]/40 pl-4 font-kr text-sm leading-7 text-[#CFC8BC]">
                {lead.challenge}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
