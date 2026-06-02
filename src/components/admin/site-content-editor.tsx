"use client";

import { updateSiteContent } from "@/app/admin/actions";
import type { SiteContent } from "@/data/content";

function Text({ label, name, def, ta }: { label: string; name: string; def?: string; ta?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">{label}</span>
      {ta ? (
        <textarea name={name} defaultValue={def} rows={3} className="border border-[#343437] bg-[#111214] p-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      ) : (
        <input name={name} defaultValue={def} className="h-11 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      )}
    </label>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border border-[#343437] p-5">
      <h2 className="font-display text-sm uppercase tracking-[0.24em] text-[#D6B77A]">{title}</h2>
      {children}
    </section>
  );
}

export function SiteContentEditor({ initial }: { initial: SiteContent }) {
  const c = initial;
  return (
    <form action={updateSiteContent} className="grid gap-8">
      <Group title="Hero">
        <Text label="Agency Tag" name="hero_agencyTag" def={c.hero.agencyTag} />
        <Text label="Overline(영문)" name="hero_overline" def={c.hero.overline} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Text label="헤드라인 앞" name="hero_headPrefix" def={c.hero.headPrefix} />
          <Text label="키워드 뒤" name="hero_keywordSuffix" def={c.hero.keywordSuffix} />
          <Text label="헤드라인 끝" name="hero_headSuffix" def={c.hero.headSuffix} />
        </div>
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">회전 키워드 (국문 / 영문)</p>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid gap-4 sm:grid-cols-2">
            <Text label={`키워드 ${i + 1} 국문`} name={`hero_kw_kr_${i}`} def={c.hero.keywords[i]?.kr} />
            <Text label={`키워드 ${i + 1} 영문`} name={`hero_kw_en_${i}`} def={c.hero.keywords[i]?.en} />
          </div>
        ))}
        <Text label="서브텍스트" name="hero_support" def={c.hero.support} ta />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="기본 CTA 라벨" name="hero_ctaPrimaryLabel" def={c.hero.ctaPrimaryLabel} />
          <Text label="기본 CTA 링크" name="hero_ctaPrimaryHref" def={c.hero.ctaPrimaryHref} />
          <Text label="보조 CTA 라벨" name="hero_ctaSecondaryLabel" def={c.hero.ctaSecondaryLabel} />
          <Text label="보조 CTA 링크" name="hero_ctaSecondaryHref" def={c.hero.ctaSecondaryHref} />
        </div>
      </Group>

      <Group title="About">
        <Text label="라벨" name="about_label" def={c.about.label} />
        <Text label="헤드라인 (줄바꿈=엔터)" name="about_headline" def={c.about.headline} ta />
        <Text label="헤드라인 강조 (줄바꿈=엔터)" name="about_headlineAccent" def={c.about.headlineAccent} ta />
        <Text label="영문 리드" name="about_lead" def={c.about.lead} />
        <Text label="본문" name="about_body" def={c.about.body} ta />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Text key={i} label={`Proof ${i + 1}`} name={`about_proof_${i}`} def={c.about.proofs[i]} />
          ))}
        </div>
      </Group>

      <Group title="Framework">
        <Text label="라벨" name="fw_label" def={c.framework.label} />
        <Text label="영문 타이틀" name="fw_title" def={c.framework.title} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid gap-3 border-l border-[#343437] pl-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label={`항목 ${i + 1} 코드(영문)`} name={`fw_code_${i}`} def={c.framework.items[i]?.code} />
              <Text label={`항목 ${i + 1} 제목`} name={`fw_title_${i}`} def={c.framework.items[i]?.title} />
            </div>
            <Text label={`항목 ${i + 1} 설명`} name={`fw_body_${i}`} def={c.framework.items[i]?.body} ta />
          </div>
        ))}
      </Group>

      <Group title="Portfolio (섹션 소개)">
        <Text label="라벨" name="pf_label" def={c.portfolio.label} />
        <Text label="헤드라인 (줄바꿈=엔터)" name="pf_headline" def={c.portfolio.headline} ta />
        <Text label="설명" name="pf_description" def={c.portfolio.description} ta />
      </Group>

      <Group title="Growth CTA">
        <Text label="라벨" name="cta_label" def={c.cta.label} />
        <Text label="헤드라인 (줄바꿈=엔터)" name="cta_headline" def={c.cta.headline} ta />
        <Text label="설명" name="cta_description" def={c.cta.description} ta />
        <Text label="컴플라이언스 (한 줄에 하나)" name="cta_compliance" def={c.cta.compliance.join("\n")} ta />
      </Group>

      <Group title="공통 (마키 · 네비 · 푸터)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="브랜드명(영문)" name="common_brandName" def={c.common.brandName} />
          <Text label="법인명(국문)" name="common_corpName" def={c.common.corpName} />
          <Text label="Contact 라벨" name="common_contactLabel" def={c.common.contactLabel} />
          <Text label="모바일 CTA 라벨" name="common_mobileCtaLabel" def={c.common.mobileCtaLabel} />
        </div>
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">네비 (라벨 / 링크)</p>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid gap-4 sm:grid-cols-2">
            <Text label={`네비 ${i + 1} 라벨`} name={`nav_label_${i}`} def={c.common.nav[i]?.label} />
            <Text label={`네비 ${i + 1} 링크`} name={`nav_href_${i}`} def={c.common.nav[i]?.href} />
          </div>
        ))}
        <Text label="마키 키워드 (한 줄에 하나)" name="common_marqueeWords" def={c.common.marqueeWords.join("\n")} ta />
        <Text label="푸터 태그라인" name="common_footerTagline" def={c.common.footerTagline} />
      </Group>

      <div className="flex gap-3">
        <button type="submit" className="bg-[#D6B77A] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0]">저장</button>
        <a href="/admin" className="border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#F4EFE5] hover:border-[#D6B77A]">취소</a>
      </div>
    </form>
  );
}
