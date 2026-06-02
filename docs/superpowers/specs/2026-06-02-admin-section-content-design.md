# 관리자 Phase 2 — 섹션 콘텐츠 편집 설계

**날짜:** 2026-06-02
**범위:** Hero / About / Framework / Growth CTA / 공통(Marquee·Nav·Footer)의 **텍스트**를 관리자에서 편집. 목록(키워드 4·프레임워크 4)은 **고정 구조 + 텍스트만** 수정(추가/삭제 없음).
**전제:** Phase 1(포트폴리오 관리자) 완료. 인증/미들웨어/Supabase·Storage·`getSupabaseAdmin()`·`ADMIN_EMAILS`·on-demand revalidate·정적 폴백 패턴을 그대로 재사용.

---

## 1. 확정 결정
- 편집 섹션: **Hero, About, Framework, Growth CTA, 공통(Marquee/Nav/Footer)**.
- 목록은 고정 개수(키워드 4, 프레임워크 4) — 텍스트만 편집.
- 저장 방식: `site_content` **단일 행** jsonb. 한 페이지·한 번 저장.
- 폴백: DB 미설정/행 없음/키 누락 시 **기본값(현재 문구)** 사용 → 사이트 무중단.
- Hero 우측 키워드 레일/모바일 그리드는 이미 제거됨(헤드라인 단어 회전만 유지). 키워드 4개는 여전히 헤드라인 회전에 사용 + 편집 대상.

## 2. 데이터 모델 (Supabase)

### 테이블 `public.site_content`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | text pk default 'singleton' | 항상 단일 행 |
| content | jsonb not null default '{}' | 전 섹션 텍스트 |
| updated_at | timestamptz default now() | 트리거 갱신 |

- RLS: 공개 `select`(anon/authenticated) 허용, `service_role` 전체 권한.
- 단일 행 보장: id 고정값 'singleton', upsert로 갱신.

### 마이그레이션 `supabase/site-content.sql`
테이블 + RLS + updated_at 트리거. 시드는 생략(빈 `{}` → 코드 기본값으로 머지). 첫 저장 시 upsert로 행 생성.

## 3. 콘텐츠 타입 & 기본값 — `src/data/content.ts`

현재 컴포넌트/`site.ts`에 흩어진 문구를 단일 소스로 정리.

```ts
export type NavItem = { label: string; href: string };
export type HeroKeyword = { kr: string; en: string };
export type FrameworkItem = { code: string; title: string; body: string };

export type SiteContent = {
  hero: {
    agencyTag: string;        // "Premium Growth Agency · Seoul"
    overline: string;         // "Structure that spreads"
    headPrefix: string;       // "브랜드가"
    keywords: HeroKeyword[];  // 4개 (검색되는/Search ...)
    keywordSuffix: string;    // "구조를"
    headSuffix: string;       // "설계합니다."
    support: string;
    ctaPrimaryLabel: string;  ctaPrimaryHref: string;   // "무료 성장 진단 받기" / "#cta"
    ctaSecondaryLabel: string; ctaSecondaryHref: string; // "포트폴리오 보기" / "#portfolio"
  };
  about: {
    label: string;            // "— 01 / About Us"
    headline: string;         // 줄바꿈은 \n 허용
    headlineAccent: string;
    lead: string;             // 영문 이탤릭
    body: string;
    proofs: string[];         // 4개
  };
  framework: {
    label: string;            // "— 02 / Framework"
    title: string;            // "Growth System"
    items: FrameworkItem[];   // 4개
  };
  cta: {
    label: string;            // "— 05 / Growth Diagnosis"
    headline: string;
    description: string;
    compliance: string[];     // 2줄
  };
  common: {
    brandName: string;        // "Dandelion Effect"
    corpName: string;         // "주식회사 민들레효과"
    contactLabel: string;     // "Contact"
    mobileCtaLabel: string;   // "무료 성장 진단"
    nav: NavItem[];           // 4개
    marqueeWords: string[];   // 6개
    footerTagline: string;    // "주식회사 민들레효과 · Premium Growth Agency"
  };
};

export const defaultContent: SiteContent = { /* 현재 화면과 100% 동일한 값 */ };
```

기존 `site.ts`의 `frameworkItems`/`marqueeWords`/`navItems`는 `defaultContent`로 이전(또는 defaultContent가 이를 참조). `portfolioCases`·`columnPreviews`는 그대로 유지(포트폴리오/저널 별도).

## 4. 조회 + 폴백 — `src/lib/site-content.ts`

```ts
export async function getSiteContent(): Promise<SiteContent>
```
- `getSupabaseAdmin()` 없으면 `defaultContent` 반환.
- `site_content` 단일 행 조회 → DB `content`를 `defaultContent`에 **섹션별 깊은 머지**(누락 키는 기본값). 배열(keywords/items/proofs/nav/marquee)은 **DB 값이 있으면 통째로 사용, 없으면 기본값**(고정 길이라 안전).
- 에러/행 없음 → 기본값.

## 5. 공개 사이트 연동 (컴포넌트 prop화)

- 홈 `src/app/page.tsx`(서버): `const [cases, content] = await Promise.all([getPublishedCases(), getSiteContent()])` → `<LandingPage cases={cases} content={content} />`.
- `LandingPage`(client): `content` prop을 각 섹션에 슬라이스로 전달.
- 리팩터 대상 컴포넌트(하드코딩 문구 → prop):
  - `site-header.tsx` ← `content.common`(brand/corp/nav/contact/mobileCta)
  - `hero.tsx` ← `content.hero`(키워드 회전 로직 유지, 텍스트만 prop)
  - `marquee.tsx` ← `content.common.marqueeWords`
  - `about.tsx` ← `content.about`
  - `framework.tsx` ← `content.framework`
  - `growth-cta.tsx` ← `content.cta`(폼은 그대로)
  - `site-footer.tsx` ← `content.common`(brand/footerTagline)
- 줄바꿈: 헤드라인 등 `\n` 포함 문자열은 `whitespace-pre-line`으로 렌더(또는 split 후 `<br/>`). 기본값은 현재 줄바꿈 유지.
- 저장 시 `revalidatePath("/")`로 즉시 반영.
- `site-header`/`site-footer`는 `LandingPage`에서 렌더되므로 prop 전달 가능. (다른 페이지 헤더/푸터는 현재 없음 — 홈 전용)

## 6. 관리자 UI — `/admin/content`

- `src/app/admin/content/page.tsx`(서버): `getSiteContent()`로 현재 값 로드 → `<SiteContentEditor initial={content} />`.
- `src/components/admin/site-content-editor.tsx`(client): 섹션별 그룹(Hero/About/Framework/CTA/공통) 폼 + **하나의 저장 버튼**. 모든 필드 `defaultValue`로 채움.
  - 배열은 고정 인덱스 입력(키워드 4행=국문/영문, 프레임워크 4행=코드/제목/설명, proofs 4, nav 4=라벨/링크, marquee 6). `name`에 인덱스 포함(예: `hero_keyword_kr_0`) 또는 `getAll`로 순서 수집.
- 관리자 상단 네비에 **"콘텐츠"** 링크 추가(`admin/layout.tsx`).
- 대시보드(`admin/page.tsx`)에 "사이트 콘텐츠 편집" 링크 추가(선택).

### 서버 액션 `updateSiteContent(formData)` (`src/app/admin/actions.ts`에 추가)
- `assertAdmin()`.
- formData → `SiteContent` 구조로 파싱(배열은 인덱스 순서로 재구성, 고정 길이 보장: 부족하면 기본값으로 채움).
- `getSupabaseAdmin().from("site_content").upsert({ id: "singleton", content })`.
- `revalidatePath("/")` + `revalidatePath("/admin/content")`.
- DB 에러 시 throw(잘못된 성공 방지).

## 7. 파일 구조 (신규/수정)

```
supabase/site-content.sql                       (신규)
src/data/content.ts                              (신규: SiteContent + defaultContent)
src/lib/site-content.ts                          (신규: getSiteContent + 머지/폴백)
src/app/admin/content/page.tsx                   (신규)
src/components/admin/site-content-editor.tsx     (신규)
src/app/admin/actions.ts                         (수정: updateSiteContent 추가)
src/app/admin/layout.tsx                         (수정: "콘텐츠" 네비)
src/app/page.tsx                                 (수정: content fetch + 전달)
src/components/landing-page.tsx                  (수정: content prop 전달)
src/components/sections/site-header.tsx          (수정: prop화)
src/components/sections/hero.tsx                 (수정: prop화)
src/components/sections/marquee.tsx              (수정: prop화)
src/components/sections/about.tsx                (수정: prop화)
src/components/sections/framework.tsx            (수정: prop화)
src/components/sections/growth-cta.tsx           (수정: prop화)
src/components/sections/site-footer.tsx          (수정: prop화)
src/data/site.ts                                 (정리: framework/marquee/nav를 content.ts로 이전 또는 재노출)
```

## 8. 에러 처리 / 보안
- `updateSiteContent`는 `assertAdmin` 후 실행, service_role로만 기록.
- 배열 길이 고정(파싱 시 기본값으로 보정) → 레이아웃 깨짐 방지.
- 폴백으로 DB 미설정/오류 시에도 사이트 정상.

## 9. 검증
- `tsc`/`lint`/`build` 통과.
- 수동: 관리자에서 Hero 헤드라인·About 본문·Framework 설명·CTA 문구·Marquee/Nav 수정 → 저장 → 홈 즉시 반영. 키워드 텍스트 수정 시 헤드라인 회전에 반영. DB 미설정 시 기본값으로 정상.

## 10. 범위 밖 (YAGNI)
- 목록 항목 추가/삭제(고정 4 유지), 저널 인트로/블로그 글, 폼 필드 구조 변경, 다국어, 이미지/색상 테마 편집, 포트폴리오(이미 Phase 1).
