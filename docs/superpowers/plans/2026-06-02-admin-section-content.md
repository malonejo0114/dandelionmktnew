# 관리자 Phase 2 — 섹션 콘텐츠 편집 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero/About/Framework/Growth CTA/공통(Marquee·Nav·Footer)의 텍스트를 Supabase `site_content`(단일 행)로 옮기고 `/admin/content`에서 편집 가능하게 한다. 정적 폴백으로 무중단.

**Architecture:** 기본값을 `src/data/content.ts`(`defaultContent`)에 중앙화. `getSiteContent()`가 DB ⊕ 기본값 머지해 항상 완전한 `SiteContent`를 반환. 홈 `page.tsx`가 서버에서 콘텐츠를 읽어 `LandingPage`→각 섹션에 prop으로 전달(하드코딩 제거). `/admin/content` 폼이 service_role로 단일 행을 upsert하고 `revalidatePath("/")`로 즉시 반영. Phase 1의 인증/폴백/패턴 재사용.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase(Postgres+RLS), Tailwind v4.

---

## 사전 메모
- **이 프로젝트는 이제 git repo다.** 각 Task 끝에 실제 커밋. 메시지 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build`. (dev는 iCloud라 부팅 느림 — tsc/build 위주.)
- 폴백 필수: Supabase 미설정/행 없음에도 사이트는 `defaultContent`로 정상 동작.
- SQL(`supabase/site-content.sql`)은 사용자가 Supabase SQL 에디터에서 실행(코드로 실행 안 함).
- **타입 계약(전 Task 공통):** `SiteContent`(Task 1 정의)를 모든 곳에서 사용.

---

## File Structure
```
src/data/content.ts                              (신규: SiteContent 타입 + defaultContent)
src/lib/site-content.ts                          (신규: getSiteContent + 머지/폴백)
supabase/site-content.sql                        (신규: 테이블+RLS+트리거)
src/app/admin/actions.ts                         (수정: updateSiteContent 추가)
src/app/admin/content/page.tsx                   (신규)
src/components/admin/site-content-editor.tsx     (신규)
src/app/admin/layout.tsx                         (수정: "콘텐츠" 네비)
src/app/page.tsx                                 (수정: getSiteContent 전달)
src/components/landing-page.tsx                  (수정: content prop)
src/components/sections/site-header.tsx          (수정: prop화)
src/components/sections/hero.tsx                 (수정: prop화)
src/components/sections/marquee.tsx              (수정: prop화)
src/components/sections/about.tsx                (수정: prop화)
src/components/sections/framework.tsx            (수정: prop화)
src/components/sections/growth-cta.tsx           (수정: prop화)
src/components/sections/site-footer.tsx          (수정: prop화)
```

---

## Task 1: content.ts — 타입 + 기본값

**Files:** Create `src/data/content.ts`

- [ ] **Step 1: 작성 (현재 화면과 100% 동일한 기본값)**

```ts
export type NavItem = { label: string; href: string };
export type HeroKeyword = { kr: string; en: string };
export type FrameworkItem = { code: string; title: string; body: string };

export type SiteContent = {
  hero: {
    agencyTag: string;
    overline: string;
    headPrefix: string;
    keywords: HeroKeyword[];
    keywordSuffix: string;
    headSuffix: string;
    support: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
  };
  about: {
    label: string;
    headline: string;
    headlineAccent: string;
    lead: string;
    body: string;
    proofs: string[];
  };
  framework: {
    label: string;
    title: string;
    items: FrameworkItem[];
  };
  cta: {
    label: string;
    headline: string;
    description: string;
    compliance: string[];
  };
  common: {
    brandName: string;
    corpName: string;
    contactLabel: string;
    mobileCtaLabel: string;
    nav: NavItem[];
    marqueeWords: string[];
    footerTagline: string;
  };
};

export const defaultContent: SiteContent = {
  hero: {
    agencyTag: "Premium Growth Agency · Seoul",
    overline: "Structure that spreads",
    headPrefix: "브랜드가",
    keywords: [
      { kr: "검색되는", en: "Search" },
      { kr: "퍼지는", en: "Spread" },
      { kr: "전환되는", en: "Convert" },
      { kr: "쌓이는", en: "Automate" },
    ],
    keywordSuffix: "구조를",
    headSuffix: "설계합니다.",
    support:
      "단순한 노출이 아니라, 상품과 업장의 본질에 맞는 구조를 설계해 브랜드의 지속 가능한 성장을 만듭니다.",
    ctaPrimaryLabel: "무료 성장 진단 받기",
    ctaPrimaryHref: "#cta",
    ctaSecondaryLabel: "포트폴리오 보기",
    ctaSecondaryHref: "#portfolio",
  },
  about: {
    label: "— 01 / About Us",
    headline: "우리는 광고를 운영하는\n회사가 아닙니다.",
    headlineAccent: "브랜드가 성장하고 확산되는\n구조를 설계합니다.",
    lead: "Great brands grow through systems, not luck.",
    body: "민들레효과는 검색, 콘텐츠, 전환, 고객 관계를 하나의 구조로 연결합니다. 광고 집행의 양보다 중요한 것은 브랜드가 스스로 검색되고, 기억되고, 상담으로 이어지는 흐름입니다.",
    proofs: ["Search", "Content", "Conversion", "Relationship"],
  },
  framework: {
    label: "— 02 / Framework",
    title: "Growth System",
    items: [
      { code: "SEARCH", title: "검색되는 구조", body: "고객이 문제를 검색하는 순간 브랜드가 발견되도록 SEO, 콘텐츠, 랜딩의 언어를 정렬합니다." },
      { code: "SPREAD", title: "퍼지는 구조", body: "광고 소재와 메시지 실험을 통해 기억에 남는 후킹 포인트를 반복적으로 찾아냅니다." },
      { code: "CONVERT", title: "전환되는 구조", body: "문의DB, 상담 흐름, CTA, 폼 마찰을 함께 보며 광고 이후의 병목을 줄입니다." },
      { code: "AUTOMATE", title: "쌓이는 구조", body: "리포트, CRM, 자동화 루틴을 연결해 다음 실험이 빨라지는 운영 체계를 만듭니다." },
    ],
  },
  cta: {
    label: "— 05 / Growth Diagnosis",
    headline: "지금의 마케팅 구조를\n진단해보세요.",
    description: "운영 중인 채널과 현재 고민을 남겨주시면 민들레효과가 성장 가능성이 높은 지점을 정리해드립니다.",
    compliance: [
      "Meta, Facebook, Instagram과 공식 제휴 관계를 의미하지 않습니다.",
      "광고 성과는 업종, 예산, 기간, 운영 상태에 따라 달라질 수 있습니다.",
    ],
  },
  common: {
    brandName: "Dandelion Effect",
    corpName: "주식회사 민들레효과",
    contactLabel: "Contact",
    mobileCtaLabel: "무료 성장 진단",
    nav: [
      { label: "About", href: "#about" },
      { label: "Framework", href: "#framework" },
      { label: "Portfolio", href: "#portfolio" },
      { label: "Journal", href: "#journal" },
    ],
    marqueeWords: ["SEARCH", "SPREAD", "CONVERT", "AUTOMATE", "BRAND SYSTEM", "GROWTH STRUCTURE"],
    footerTagline: "주식회사 민들레효과 · Premium Growth Agency",
  },
};
```

- [ ] **Step 2: tsc + commit**
Run: `npx tsc --noEmit` → 클린.
`git add src/data/content.ts && git commit -m "feat(content): SiteContent 타입 + 기본값 중앙화"`

---

## Task 2: site-content.ts (조회+폴백) + SQL

**Files:** Create `src/lib/site-content.ts`, `supabase/site-content.sql`

- [ ] **Step 1: getSiteContent 작성**

```ts
import { getSupabaseAdmin } from "@/lib/supabase";
import { defaultContent, type SiteContent } from "@/data/content";

/** DB 단일 행(content jsonb)을 기본값 위에 섹션별로 머지. 미설정/오류 시 기본값. */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultContent;
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", "singleton")
    .maybeSingle();
  if (error || !data?.content) return defaultContent;
  const c = data.content as Partial<SiteContent>;
  // 섹션별 얕은 머지(섹션 단위로 DB 값 우선, 없으면 기본값). 배열은 DB 값이 있으면 통째 사용.
  return {
    hero: { ...defaultContent.hero, ...(c.hero ?? {}) },
    about: { ...defaultContent.about, ...(c.about ?? {}) },
    framework: { ...defaultContent.framework, ...(c.framework ?? {}) },
    cta: { ...defaultContent.cta, ...(c.cta ?? {}) },
    common: { ...defaultContent.common, ...(c.common ?? {}) },
  };
}
```

- [ ] **Step 2: SQL 파일 작성**

`supabase/site-content.sql`:
```sql
create table if not exists public.site_content (
  id text primary key default 'singleton',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content"
on public.site_content for select to anon, authenticated using (true);

drop policy if exists "service role manages site content" on public.site_content;
create policy "service role manages site content"
on public.site_content for all to service_role using (true) with check (true);
```

- [ ] **Step 3: tsc + commit**
Run: `npx tsc --noEmit` → 클린.
`git add src/lib/site-content.ts supabase/site-content.sql && git commit -m "feat(content): site_content 조회+폴백 + SQL"`

---

## Task 3: 공개 컴포넌트 prop화 + 데이터 흐름

**Files:** Modify `src/app/page.tsx`, `src/components/landing-page.tsx`, `src/components/sections/{site-header,hero,marquee,about,framework,growth-cta,site-footer}.tsx`

각 컴포넌트의 className/구조는 **그대로 두고** 하드코딩 텍스트만 prop으로 교체한다. 멀티라인 문자열(about.headline 등)은 `whitespace-pre-line`으로 렌더.

- [ ] **Step 1: page.tsx — 콘텐츠도 조회해 전달**

```tsx
import { LandingPage } from "@/components/landing-page";
import { getPublishedCases } from "@/lib/portfolio";
import { getSiteContent } from "@/lib/site-content";

export default async function Home() {
  const [cases, content] = await Promise.all([getPublishedCases(), getSiteContent()]);
  return <LandingPage cases={cases} content={content} />;
}
```

- [ ] **Step 2: landing-page.tsx — content prop 추가 + 전달**

기존 import에 추가: `import type { SiteContent } from "@/data/content";`
시그니처: `export function LandingPage({ cases, content }: { cases: Case[]; content: SiteContent }) {`
JSX의 각 섹션에 prop 전달:
```tsx
      <SiteHeader common={content.common} />
      <main>
        <Hero hero={content.hero} />
        <Marquee words={content.common.marqueeWords} />
        <About about={content.about} />
        <Framework framework={content.framework} />
        <Portfolio cases={cases} />
        <Journal />
        <GrowthCTA cta={content.cta} />
      </main>
      <SiteFooter common={content.common} />
```
(GSAP useEffect/래퍼 div는 그대로.)

- [ ] **Step 3: site-header.tsx — `common` prop화**

`import { navItems } from "@/data/site";` 제거. 시그니처를 `export function SiteHeader({ common }: { common: SiteContent["common"] })`로. `import type { SiteContent } from "@/data/content";` 추가. 내부에서:
- 워드마크 2곳 `Dandelion Effect` → `{common.brandName}`
- `주식회사 민들레효과` → `{common.corpName}`
- `navItems.map` 2곳 → `common.nav.map`
- 데스크탑 `Contact` → `{common.contactLabel}`
- 모바일 오버레이 `무료 성장 진단` → `{common.mobileCtaLabel}`
나머지(스크롤/오버레이 로직, className) 동일.

- [ ] **Step 4: hero.tsx — `hero` prop화 (키워드 회전 유지)**

`KEYWORDS` 상수 제거. `import type { SiteContent } from "@/data/content";` 추가. 시그니처 `export function Hero({ hero }: { hero: SiteContent["hero"] })`. 내부:
- `const keywords = hero.keywords;` 회전 인터벌은 `keywords.length` 사용.
- 에이전시 태그 → `{hero.agencyTag}`, 오버라인 → `{hero.overline}`
- 헤드라인: `{hero.headPrefix}` / `{keywords[active].kr} {hero.keywordSuffix}` / `{hero.headSuffix}`
- 서브텍스트 → `{hero.support}`
- CTA: 라벨/href → `{hero.ctaPrimaryLabel}`/`hero.ctaPrimaryHref`, `{hero.ctaSecondaryLabel}`/`hero.ctaSecondaryHref`
- 레일/모바일 그리드는 이미 제거됨(추가 금지). `active` 상태/인터벌 유지.

- [ ] **Step 5: marquee.tsx — `words` prop화**

```tsx
import type { SiteContent } from "@/data/content";

export function Marquee({ words: source }: { words: SiteContent["common"]["marqueeWords"] }) {
  const words = [...source, ...source];
  return ( /* 기존 JSX 동일, marqueeWords→words */ );
}
```
(`import { marqueeWords } from "@/data/site";` 제거.)

- [ ] **Step 6: about.tsx — `about` prop화 + 멀티라인**

`export function About({ about }: { about: SiteContent["about"] })` + `import type { SiteContent } from "@/data/content";`
- label → `{about.label}`
- 헤드라인 `<h2>` 본문을 멀티라인 지원으로:
  ```tsx
  <h2 className="... font-kr ... whitespace-pre-line">
    {about.headline}
    <span className="mt-5 block font-medium text-[#E7D2A0] whitespace-pre-line">
      {about.headlineAccent}
    </span>
  </h2>
  ```
  (기존 `<br />`/literal 제거, `whitespace-pre-line` 추가)
- lead → `{about.lead}`, body → `{about.body}`
- proofs: `{about.proofs.map((p) => ( ... {p} ... ))}` (기존 하드코딩 배열 대체)

- [ ] **Step 7: framework.tsx — `framework` prop화**

`import { frameworkItems } from "@/data/site";` 제거. `export function Framework({ framework }: { framework: SiteContent["framework"] })` + type import.
- label → `{framework.label}`, 타이틀 → `{framework.title}`
- `framework.items.map((item, i) => ...)` (기존 frameworkItems → framework.items). 내부 item.code/title/body 동일.

- [ ] **Step 8: growth-cta.tsx — `cta` prop화 + 멀티라인**

`export function GrowthCTA({ cta }: { cta: SiteContent["cta"] })` + type import.
- label → `{cta.label}`
- 헤드라인 `<h2 className="... whitespace-pre-line">{cta.headline}</h2>` (기존 `<br />` 제거)
- description → `{cta.description}`
- compliance: `{cta.compliance.map((line, i) => <p key={i}>{line}</p>)}`
- `<LeadForm />` 그대로.

- [ ] **Step 9: site-footer.tsx — `common` prop화**

`export function SiteFooter({ common }: { common: SiteContent["common"] })` + type import.
- 워드마크 → `{common.brandName}`, 태그라인 → `{common.footerTagline}`
- 링크(Journal/RSS/Contact)는 그대로 하드코딩 유지.

- [ ] **Step 10: 검증 + commit**
Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: 빌드 성공, 라우트 동일. Supabase env 있으면 DB(현재 빈 `{}` → 기본값 머지) → 화면 변화 없음. 폴백/DB 모두 현재와 동일 렌더.
`git add -A && git commit -m "refactor(sections): 텍스트를 content prop으로 분리"`

---

## Task 4: 관리자 — 액션 + 에디터 + 페이지 + 네비

**Files:** Modify `src/app/admin/actions.ts`, `src/app/admin/layout.tsx`; Create `src/app/admin/content/page.tsx`, `src/components/admin/site-content-editor.tsx`

- [ ] **Step 1: updateSiteContent 액션 추가 (actions.ts 끝에 append)**

기존 import 재사용(`revalidatePath`, `getSupabaseAdmin`, `assertAdmin`). `SiteContent` 타입 import 추가: 파일 상단 import 블록에 `import type { SiteContent } from "@/data/content";` 추가.

append:
```ts
function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function parseSiteContent(formData: FormData): SiteContent {
  const lines = (key: string) =>
    str(formData, key).split("\n").map((s) => s.trim()).filter(Boolean);
  const keywords = [0, 1, 2, 3].map((i) => ({
    kr: str(formData, `hero_kw_kr_${i}`),
    en: str(formData, `hero_kw_en_${i}`),
  }));
  const items = [0, 1, 2, 3].map((i) => ({
    code: str(formData, `fw_code_${i}`),
    title: str(formData, `fw_title_${i}`),
    body: str(formData, `fw_body_${i}`),
  }));
  const proofs = [0, 1, 2, 3].map((i) => str(formData, `about_proof_${i}`));
  const nav = [0, 1, 2, 3].map((i) => ({
    label: str(formData, `nav_label_${i}`),
    href: str(formData, `nav_href_${i}`),
  }));
  return {
    hero: {
      agencyTag: str(formData, "hero_agencyTag"),
      overline: str(formData, "hero_overline"),
      headPrefix: str(formData, "hero_headPrefix"),
      keywords,
      keywordSuffix: str(formData, "hero_keywordSuffix"),
      headSuffix: str(formData, "hero_headSuffix"),
      support: str(formData, "hero_support"),
      ctaPrimaryLabel: str(formData, "hero_ctaPrimaryLabel"),
      ctaPrimaryHref: str(formData, "hero_ctaPrimaryHref"),
      ctaSecondaryLabel: str(formData, "hero_ctaSecondaryLabel"),
      ctaSecondaryHref: str(formData, "hero_ctaSecondaryHref"),
    },
    about: {
      label: str(formData, "about_label"),
      headline: str(formData, "about_headline"),
      headlineAccent: str(formData, "about_headlineAccent"),
      lead: str(formData, "about_lead"),
      body: str(formData, "about_body"),
      proofs,
    },
    framework: {
      label: str(formData, "fw_label"),
      title: str(formData, "fw_title"),
      items,
    },
    cta: {
      label: str(formData, "cta_label"),
      headline: str(formData, "cta_headline"),
      description: str(formData, "cta_description"),
      compliance: lines("cta_compliance"),
    },
    common: {
      brandName: str(formData, "common_brandName"),
      corpName: str(formData, "common_corpName"),
      contactLabel: str(formData, "common_contactLabel"),
      mobileCtaLabel: str(formData, "common_mobileCtaLabel"),
      nav,
      marqueeWords: lines("common_marqueeWords"),
      footerTagline: str(formData, "common_footerTagline"),
    },
  };
}

export async function updateSiteContent(formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const content = parseSiteContent(formData);
  const { error } = await supabase
    .from("site_content")
    .upsert({ id: "singleton", content });
  if (error) throw new Error(`저장 실패: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content");
}
```
(주의: `fw_title`은 framework.title, `fw_title_${i}`는 항목 제목 — 키가 다르므로 충돌 없음. `cta_compliance`/`common_marqueeWords`는 textarea 줄단위.)

- [ ] **Step 2: 에디터 컴포넌트 작성**

Create `src/components/admin/site-content-editor.tsx`:
```tsx
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
```

- [ ] **Step 3: /admin/content 페이지**

Create `src/app/admin/content/page.tsx`:
```tsx
import { SiteContentEditor } from "@/components/admin/site-content-editor";
import { getSiteContent } from "@/lib/site-content";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">사이트 콘텐츠</h1>
      <SiteContentEditor initial={content} />
    </div>
  );
}
```

- [ ] **Step 4: 관리자 네비에 "콘텐츠" 추가**

`src/app/admin/layout.tsx`의 nav에 Portfolio 링크 옆에 추가:
```tsx
          <Link href="/admin/content" className="hover:text-[#D6B77A]">콘텐츠</Link>
```
(기존 `<Link href="/admin/portfolio" ...>Portfolio</Link>` 다음 줄에.)

- [ ] **Step 5: 검증 + commit**
Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: 빌드 성공, 라우트에 `/admin/content` 등장.
`git add -A && git commit -m "feat(admin): 섹션 콘텐츠 편집 페이지/액션/에디터"`

---

## Task 5: 통합 검증 + 배포

- [ ] **Step 1: 최종 빌드**
Run: `npx tsc --noEmit && npm run lint && npm run build` → 전부 통과.

- [ ] **Step 2: (사용자) SQL 실행**
Supabase SQL 에디터에서 `supabase/site-content.sql` 실행(테이블+RLS+트리거 생성).

- [ ] **Step 3: 푸시 → Vercel 배포**
`git push origin main` → Vercel 자동 배포(누락 시 빈 커밋으로 재유도).

- [ ] **Step 4: (사용자) 수동 확인**
`/admin/content` 진입 → Hero 헤드라인/About 본문/Framework 설명/CTA 문구/Marquee·Nav 수정 → 저장 → 홈 즉시 반영. 키워드 텍스트 수정 시 헤드라인 회전 반영. DB 미설정 시에도 기본값으로 정상.

---

## Self-Review (작성자 체크)
- **Spec 커버리지:** 데이터모델/SQL(Task2) · content.ts 기본값(Task1) · getSiteContent 폴백(Task2) · 공개 prop화 7개+page+landing(Task3) · 관리자 액션/에디터/페이지/네비(Task4) · 검증(Task5) ✅
- **플레이스홀더:** 없음(전 코드 제시). 기본값은 현재 컴포넌트 문구 그대로.
- **타입 일관성:** `SiteContent` 슬라이스 prop명(`hero/about/framework/cta/common`, `words`) ↔ landing-page 전달 ↔ 에디터 폼 name ↔ `parseSiteContent` 키 일치. 폼 키 충돌 점검: `fw_title`(타이틀) vs `fw_title_${i}`(항목 제목) — 접미사로 구분됨 ✅. `cta_compliance`/`common_marqueeWords`는 textarea 줄단위 파싱.
- **주의:** site.ts의 `frameworkItems`/`marqueeWords`/`navItems`는 Task3 이후 미사용(삭제 안 해도 무해, lint 경고 없음). `portfolioCases`/`columnPreviews`는 유지.
- **멀티라인:** about/cta 헤드라인은 `whitespace-pre-line` + `\n`. 기본값에 `\n` 포함되어 현재 줄바꿈 유지.
