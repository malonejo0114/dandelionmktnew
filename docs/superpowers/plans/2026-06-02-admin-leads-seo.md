# 관리자 문의함 + 전역 SEO 편집 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자에 문의함(`/admin/leads`, 보기+삭제)을 추가하고, 전역 SEO 메타데이터를 `/admin/content`에서 편집 가능하게 한다(폴백 포함).

**Architecture:** 문의함은 기존 `leads` 테이블을 service-role로 조회/삭제하는 서버 컴포넌트+액션. SEO는 `SiteContent`에 `seo` 섹션을 추가해 `site_content` jsonb에 저장하고, 루트 `layout.tsx`를 동적 `generateMetadata()`로 바꿔 `getSiteContent().seo`에서 읽는다. 편집은 기존 콘텐츠 에디터에 "SEO" 그룹으로 추가. Phase 1·2 인증/폴백 패턴 재사용.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase, Tailwind v4.

---

## 사전 메모
- git repo — 각 Task 끝에 실제 커밋(메시지 끝 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).
- 검증: `npx tsc --noEmit` + `npm run lint`. **로컬 `npm run build`는 iCloud로 멈추므로 실행하지 말 것** — 최종 빌드는 Vercel(푸시 시)로 검증.
- 스키마 변경 없음(문의함=기존 leads, SEO=기존 site_content jsonb).
- `getSupabaseAdmin()`(@/lib/supabase), `assertAdmin()`(actions.ts 내부), `revalidatePath`, `getSiteContent()`(@/lib/site-content) 재사용.

---

## File Structure
```
src/app/admin/actions.ts                      (수정: deleteLead 추가, parseSiteContent에 seo)
src/app/admin/leads/page.tsx                  (신규: 문의함)
src/app/admin/layout.tsx                      (수정: 문의함 네비)
src/app/admin/page.tsx                        (수정: 문의 수 타일)
src/data/content.ts                           (수정: SiteContent.seo + 기본값)
src/lib/site-content.ts                       (수정: seo 머지)
src/app/layout.tsx                            (수정: generateMetadata)
src/components/admin/site-content-editor.tsx  (수정: SEO 그룹)
```

---

## Task 1: 문의함 `/admin/leads` (보기 + 삭제)

**Files:** Modify `src/app/admin/actions.ts`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`; Create `src/app/admin/leads/page.tsx`

- [ ] **Step 1: deleteLead 액션 추가**

`src/app/admin/actions.ts` 끝에 APPEND (기존 `assertAdmin`/`getSupabaseAdmin`/`revalidatePath` 재사용, import 추가 없음):
```ts
export async function deleteLead(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}
```

- [ ] **Step 2: 문의함 페이지 작성**

Create `src/app/admin/leads/page.tsx`:
```tsx
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
```

- [ ] **Step 3: 관리자 네비에 문의함 추가**

`src/app/admin/layout.tsx`의 `<nav>`에서 `콘텐츠` 링크 다음 줄에 추가:
```tsx
          <Link href="/admin/leads" className="hover:text-[#D6B77A]">문의함</Link>
```

- [ ] **Step 4: 대시보드에 문의 수 타일 추가**

`src/app/admin/page.tsx`를 아래로 교체(문의 수 조회 + 타일 추가):
```tsx
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
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 검증 + 커밋**
Run: `cd /Users/johanjin/Documents/homedandel && npx tsc --noEmit && npm run lint` → 클린.
`git add -A && git commit -m "feat(admin): 문의함(leads 목록+삭제) + 대시보드 문의 수"` (+ Co-Authored-By trailer)

---

## Task 2: SEO 콘텐츠 모델 + 편집 그룹

**Files:** Modify `src/data/content.ts`, `src/lib/site-content.ts`, `src/app/admin/actions.ts`, `src/components/admin/site-content-editor.tsx`

- [ ] **Step 1: content.ts — seo 타입 + 기본값**

`src/data/content.ts`의 `SiteContent` 타입에서 `common` 블록 바로 앞(또는 뒤)에 `seo` 추가:
```ts
  seo: {
    title: string;
    titleTemplate: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
```
`defaultContent`에 (common과 같은 레벨에) 추가:
```ts
  seo: {
    title: "Dandelion Effect | 브랜드가 퍼지는 구조를 설계합니다",
    titleTemplate: "%s | Dandelion Effect",
    description:
      "주식회사 민들레효과는 브랜드가 검색되고, 기억되고, 확산되고, 전환되는 구조를 설계하는 프리미엄 마케팅 에이전시입니다.",
    ogTitle: "Dandelion Effect | 브랜드 성장 설계 회사",
    ogDescription: "광고 운영을 넘어 검색, 확산, 전환, 자동화까지 이어지는 성장 구조를 설계합니다.",
  },
```

- [ ] **Step 2: site-content.ts — seo 머지**

`getSiteContent` 반환 객체에 추가(common 줄 옆):
```ts
    seo: { ...defaultContent.seo, ...(c.seo ?? {}) },
```

- [ ] **Step 3: actions.ts parseSiteContent — seo 파싱**

`parseSiteContent` 반환 객체에 `common` 옆에 추가:
```ts
    seo: {
      title: str(formData, "seo_title"),
      titleTemplate: str(formData, "seo_titleTemplate"),
      description: str(formData, "seo_description"),
      ogTitle: str(formData, "seo_ogTitle"),
      ogDescription: str(formData, "seo_ogDescription"),
    },
```

- [ ] **Step 4: 에디터에 SEO 그룹 추가**

`src/components/admin/site-content-editor.tsx`에서 "공통 (마키 · 네비 · 푸터)" `<Group>` **다음**(닫는 `</Group>` 뒤, 저장 버튼 `<div className="flex gap-3">` 앞)에 추가:
```tsx
      <Group title="SEO (검색/공유 메타)">
        <Text label="사이트 제목" name="seo_title" def={c.seo.title} />
        <Text label="제목 템플릿 (%s = 페이지명)" name="seo_titleTemplate" def={c.seo.titleTemplate} />
        <Text label="설명(description)" name="seo_description" def={c.seo.description} ta />
        <Text label="OG 제목" name="seo_ogTitle" def={c.seo.ogTitle} />
        <Text label="OG 설명" name="seo_ogDescription" def={c.seo.ogDescription} ta />
      </Group>
```

- [ ] **Step 5: 검증 + 커밋**
Run: `npx tsc --noEmit && npm run lint` → 클린.
`git add -A && git commit -m "feat(content): 전역 SEO 섹션(모델+에디터)"` (+ trailer)

---

## Task 3: layout.tsx 동적 generateMetadata + 배포

**Files:** Modify `src/app/layout.tsx`

- [ ] **Step 1: 정적 metadata → 동적 generateMetadata**

READ `src/app/layout.tsx` 먼저. `import type { Metadata, Viewport } from "next";`는 유지. 추가: `import { getSiteContent } from "@/lib/site-content";`
`export const metadata: Metadata = { ... }` 블록 전체를 아래로 교체(나머지 폰트/viewport/RootLayout은 그대로):
```ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dandelionmkt.co.kr";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteContent();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.title,
      template: seo.titleTemplate,
    },
    description: seo.description,
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: "/",
      siteName: "Dandelion Effect",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [
        { url: "/opengraph-image", width: 1200, height: 630, alt: "Dandelion Effect" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: ["/opengraph-image"],
    },
  };
}
```
(기존 `const siteUrl = ...` 줄이 이미 있으면 중복 정의하지 말고 재사용. `export const viewport` 유지.)

- [ ] **Step 2: 검증 + 커밋**
Run: `npx tsc --noEmit && npm run lint` → 클린.
`git add -A && git commit -m "feat(seo): layout 동적 generateMetadata (DB 연동)"` (+ trailer)

- [ ] **Step 3: 배포**
`git push origin main` → Vercel 자동 배포(누락 시 빈 커밋 재유도). 배포 success 확인이 최종 빌드 검증.

- [ ] **Step 4: (사용자) 수동 확인**
- `/admin/leads`에서 문의 목록·삭제 동작. 홈 폼으로 테스트 문의 제출 후 표시 확인.
- `/admin/content` 하단 "SEO" 그룹에서 제목/설명 수정 → 저장 → 홈 페이지 소스(View Source)의 `<title>`/`<meta name=description>`/OG 태그 반영 확인.

---

## Self-Review (작성자 체크)
- **Spec 커버리지:** 문의함 보기+삭제(Task1) · 대시보드 문의 수(Task1) · 네비(Task1) · seo 모델/머지/파싱/에디터(Task2) · layout 동적 메타(Task3) · 배포/검증(Task3) ✅
- **플레이스홀더:** 없음(전 코드 제시).
- **타입 일관성:** `SiteContent.seo` 필드(title/titleTemplate/description/ogTitle/ogDescription) ↔ 에디터 name(`seo_*`) ↔ `parseSiteContent` 키 ↔ `generateMetadata` 사용 일치. `deleteLead`는 `.bind(null, id)` + `<form action>` 패턴(기존 deleteCase와 동일). `leads` 컬럼명은 `supabase/leads.sql`과 일치(name/phone/email/industry/channel/challenge/marketing_consent/created_at).
- **폴백:** generateMetadata는 getSiteContent 폴백으로 DB 미설정에도 기본 SEO. 문의함/대시보드는 supabase null 시 안내/0.
- **주의:** Task3는 Task2(seo 모델) 이후 실행. layout.tsx에 이미 `siteUrl` 상수가 있으므로 중복 선언 금지.
