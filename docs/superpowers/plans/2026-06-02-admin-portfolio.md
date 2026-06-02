# 관리자(포트폴리오) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase 기반 포트폴리오 관리자(Magic Link 인증 + 카드/케이스 CRUD + 미디어 업로드)를 만들고, 공개 사이트가 DB에서 포트폴리오를 읽도록 전환한다(정적 폴백 포함).

**Architecture:** 콘텐츠를 `portfolio_cases` 테이블 + `portfolio-media` Storage 버킷에 저장. `@supabase/ssr` 쿠키 세션으로 Magic Link 로그인, `ADMIN_EMAILS` allowlist + 미들웨어로 `/admin/*` 보호. 공개 페이지(홈·`/portfolio/[slug]`·sitemap)는 서버에서 DB 조회 후 렌더하고, 저장 시 on-demand revalidate로 갱신. Supabase 미설정/빈 데이터면 기존 `src/data/site.ts`의 `portfolioCases`로 폴백.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase (Postgres + Auth + Storage), `@supabase/ssr` 0.10.x, `@supabase/supabase-js` (설치됨), Tailwind v4.

---

## 사전 메모

- **Git 미초기화:** 커밋 대신 각 Task 끝에 **Checkpoint**(tsc/lint/build/수동확인).
- **검증:** `npx tsc --noEmit`, `npm run lint`, `npm run build`. 그리고 dev 서버(`npm run dev -- -H 0.0.0.0`)로 수동 플로우 확인.
- **환경변수:** 실제 Supabase 키는 사용자가 `.env.local`에 채운다. 키가 없어도 **폴백 경로로 사이트가 정상 동작**해야 한다(빌드/렌더 깨지면 안 됨).
- **Case 타입 계약(전 Task 공통):**
  ```ts
  export type CaseDetailBlock = { heading: string; body: string };
  export type Case = {
    slug: string;
    industry: string;
    title: string;
    problem: string;
    strategy: string;
    result: string;
    duration: string;
    summary: string;
    detail: CaseDetailBlock[];
    video: string;   // 공개용 최종 URL (없으면 "/hero.mp4")
    poster: string;  // 없으면 "/hero-poster.jpg"
  };
  ```
  DB 컬럼 `video_url`/`poster_url`(nullable) → `Case.video`/`Case.poster`로 매핑(널이면 기본값).

---

## File Structure

```
supabase/portfolio.sql                       (신규: 스키마+RLS+시드)
.env.example                                 (수정)
package.json                                 (수정: @supabase/ssr)
src/lib/supabase/server.ts                   (신규: SSR 서버 클라이언트)
src/lib/supabase/client.ts                   (신규: 브라우저 클라이언트)
src/lib/admin-auth.ts                         (신규: allowlist 검증)
src/lib/portfolio.ts                          (신규: Case 타입 + 조회 + 폴백)
middleware.ts                                 (신규)
src/app/auth/callback/route.ts                (신규)
src/app/admin/actions.ts                      (신규: 서버 액션)
src/app/admin/login/page.tsx                  (신규)
src/app/admin/layout.tsx                      (신규)
src/app/admin/page.tsx                        (신규)
src/app/admin/portfolio/page.tsx              (신규)
src/app/admin/portfolio/new/page.tsx          (신규)
src/app/admin/portfolio/[id]/page.tsx         (신규)
src/components/admin/case-editor.tsx          (신규)
src/components/admin/media-upload.tsx         (신규)
src/app/page.tsx                              (수정: cases fetch → prop)
src/components/landing-page.tsx               (수정: cases prop 전달)
src/components/sections/portfolio.tsx         (수정: prop 사용)
src/app/portfolio/[slug]/page.tsx             (수정: DB 조회)
src/app/sitemap.ts                            (수정: DB 조회)
```

---

## Task 1: 의존성 · 환경변수 · Supabase 클라이언트 · SQL

**Files:**
- Modify: `package.json` (의존성)
- Modify: `.env.example`
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/admin-auth.ts`
- Create: `supabase/portfolio.sql`

- [ ] **Step 1: @supabase/ssr 설치**

Run: `cd /Users/johanjin/Documents/homedandel && npm install @supabase/ssr@^0.10.3`
Expected: 설치 성공, package.json dependencies에 추가.

- [ ] **Step 2: .env.example 갱신**

`.env.example`를 아래로 교체:
```
NEXT_PUBLIC_SITE_URL=https://dandelionmkt.co.kr

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_LEADS_TABLE=leads

# 관리자 허용 이메일 (쉼표 구분)
ADMIN_EMAILS=
```

- [ ] **Step 3: 브라우저 클라이언트**

Create `src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: 서버 클라이언트(쿠키 세션)**

Create `src/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 set 호출 시 무시(미들웨어가 갱신 담당)
          }
        },
      },
    },
  );
}
```

- [ ] **Step 5: 관리자 allowlist 헬퍼**

Create `src/lib/admin-auth.ts`:
```ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowedAdminEmails().includes(email.toLowerCase());
}

/** 현재 세션의 인증·allowlist를 확인. 통과 시 email 반환, 아니면 null. */
export async function getAdminEmail(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAllowedAdmin(user?.email) ? user!.email! : null;
}
```

- [ ] **Step 6: SQL 마이그레이션 + 시드**

Create `supabase/portfolio.sql`:
```sql
-- 포트폴리오 케이스 테이블
create table if not exists public.portfolio_cases (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  industry text not null,
  title text not null,
  problem text not null,
  strategy text not null,
  result text not null,
  duration text not null,
  summary text not null default '',
  detail jsonb not null default '[]'::jsonb,
  video_url text,
  poster_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_cases_sort_idx on public.portfolio_cases (sort_order);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists portfolio_cases_updated_at on public.portfolio_cases;
create trigger portfolio_cases_updated_at
before update on public.portfolio_cases
for each row execute function public.set_updated_at();

-- RLS
alter table public.portfolio_cases enable row level security;

drop policy if exists "public can read published cases" on public.portfolio_cases;
create policy "public can read published cases"
on public.portfolio_cases for select
to anon, authenticated
using (published = true);

drop policy if exists "service role manages cases" on public.portfolio_cases;
create policy "service role manages cases"
on public.portfolio_cases for all
to service_role using (true) with check (true);

-- Storage 버킷 (대시보드에서 생성하거나 아래 실행)
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

drop policy if exists "public read portfolio media" on storage.objects;
create policy "public read portfolio media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

-- 기존 3개 케이스 시드 (video_url/poster_url null → 폴백)
insert into public.portfolio_cases (slug, industry, title, problem, strategy, result, duration, summary, detail, sort_order, published)
values
('skin-clinic-search','피부과','검색 유입 구조 개선','검색 유입은 있었지만 랜딩 메시지와 상담 문의 흐름이 분리되어 있었습니다.','SEO 콘텐츠, 랜딩페이지 카피, 상담 CTA를 하나의 검색 의도에 맞춰 재설계했습니다.','상담 전환 증가','4개월','검색 유입과 상담 흐름을 하나의 구조로 정렬해 상담 전환을 끌어올린 피부과 케이스입니다.',
 '[{"heading":"배경","body":"내원 문의를 만드는 검색 유입은 있었지만, 검색 의도와 랜딩 메시지, 상담 CTA가 서로 다른 언어로 흩어져 있어 방문이 상담으로 이어지지 않았습니다."},{"heading":"접근","body":"핵심 검색 키워드를 상담 의사결정 순서로 재정의하고, SEO 콘텐츠·랜딩 카피·상담 CTA를 하나의 흐름으로 다시 설계했습니다."},{"heading":"결과","body":"검색 유입의 상담 전환이 개선되었고, 어떤 키워드가 상담으로 이어지는지 반복 측정 가능한 구조가 남았습니다."}]'::jsonb,
 0, true),
('education-funnel','교육 서비스','상담 퍼널 재정렬','광고 클릭 이후 문의DB가 충분히 쌓이지 않고 상담 품질 편차가 컸습니다.','소재 후킹, 랜딩 구조, 문의폼 필드를 상담 의사결정 순서에 맞춰 정리했습니다.','문의 완료율 개선','8주','광고 이후의 병목을 소재·랜딩·문의폼까지 한 흐름으로 정리해 문의 완료율을 높인 교육 서비스 케이스입니다.',
 '[{"heading":"배경","body":"광고 클릭은 발생했지만 문의DB가 충분히 쌓이지 않았고, 들어온 상담의 품질 편차도 컸습니다."},{"heading":"접근","body":"소재의 후킹 포인트, 랜딩 구조, 문의폼 필드를 상담 의사결정 순서에 맞춰 재정렬했습니다."},{"heading":"결과","body":"문의 완료율이 개선되고, 상담 전 단계에서 더 정제된 정보가 쌓이는 퍼널이 만들어졌습니다."}]'::jsonb,
 1, true),
('local-brand-system','로컬 브랜드','브랜드 확산 시스템 구축','콘텐츠, 광고, 고객 후기가 각각 따로 운영되어 브랜드 기억이 누적되지 않았습니다.','검색 키워드, 리뷰 메시지, 광고 소재, 리타겟팅 흐름을 같은 브랜드 언어로 연결했습니다.','브랜드 검색 신호 강화','12주','흩어져 있던 콘텐츠·광고·후기를 하나의 브랜드 언어로 연결해 브랜드 검색 신호를 키운 로컬 브랜드 케이스입니다.',
 '[{"heading":"배경","body":"콘텐츠, 광고, 고객 후기가 각각 따로 운영되어 브랜드 기억이 누적되지 않았습니다."},{"heading":"접근","body":"검색 키워드, 리뷰 메시지, 광고 소재, 리타겟팅 흐름을 같은 브랜드 언어로 묶어 하나의 확산 구조로 연결했습니다."},{"heading":"결과","body":"브랜드명 검색 신호가 강화되고, 채널마다 흩어졌던 메시지가 누적되는 자산이 되었습니다."}]'::jsonb,
 2, true)
on conflict (slug) do nothing;
```

- [ ] **Step 7: Checkpoint**

Run: `cd /Users/johanjin/Documents/homedandel && npx tsc --noEmit`
Expected: 클린. (새 lib 파일은 아직 미사용이어도 OK.)
참고: `supabase/portfolio.sql`은 사용자가 Supabase SQL 에디터에서 실행한다(코드에서 실행하지 않음).

---

## Task 2: lib/portfolio.ts — 조회 + 폴백

**Files:**
- Create: `src/lib/portfolio.ts`

- [ ] **Step 1: Case 타입 + DB 조회 + site.ts 폴백 구현**

Create `src/lib/portfolio.ts`:
```ts
import { getSupabaseAdmin } from "@/lib/supabase";
import { portfolioCases as staticCases } from "@/data/site";

export type CaseDetailBlock = { heading: string; body: string };
export type Case = {
  slug: string;
  industry: string;
  title: string;
  problem: string;
  strategy: string;
  result: string;
  duration: string;
  summary: string;
  detail: CaseDetailBlock[];
  video: string;
  poster: string;
};

const FALLBACK_VIDEO = "/hero.mp4";
const FALLBACK_POSTER = "/hero-poster.jpg";

function fromStatic(): Case[] {
  return staticCases.map((c) => ({
    slug: c.slug,
    industry: c.industry,
    title: c.title,
    problem: c.problem,
    strategy: c.strategy,
    result: c.result,
    duration: c.duration,
    summary: c.summary,
    detail: c.detail,
    video: c.video ?? FALLBACK_VIDEO,
    poster: c.poster ?? FALLBACK_POSTER,
  }));
}

type Row = {
  slug: string; industry: string; title: string; problem: string;
  strategy: string; result: string; duration: string; summary: string;
  detail: CaseDetailBlock[] | null; video_url: string | null; poster_url: string | null;
};

function fromRow(r: Row): Case {
  return {
    slug: r.slug,
    industry: r.industry,
    title: r.title,
    problem: r.problem,
    strategy: r.strategy,
    result: r.result,
    duration: r.duration,
    summary: r.summary,
    detail: Array.isArray(r.detail) ? r.detail : [],
    video: r.video_url || FALLBACK_VIDEO,
    poster: r.poster_url || FALLBACK_POSTER,
  };
}

/** 공개용: published 케이스를 sort_order 순으로. DB 미설정/에러/빈 결과면 정적 폴백. */
export async function getPublishedCases(): Promise<Case[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fromStatic();
  const { data, error } = await supabase
    .from("portfolio_cases")
    .select("slug,industry,title,problem,strategy,result,duration,summary,detail,video_url,poster_url")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return fromStatic();
  return (data as Row[]).map(fromRow);
}

export async function getCaseBySlug(slug: string): Promise<Case | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fromStatic().find((c) => c.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("portfolio_cases")
    .select("slug,industry,title,problem,strategy,result,duration,summary,detail,video_url,poster_url")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return fromStatic().find((c) => c.slug === slug) ?? null;
  return fromRow(data as Row);
}
```

- [ ] **Step 2: Checkpoint**

Run: `npx tsc --noEmit`
Expected: 클린. (`staticCases`의 각 항목에 slug/summary/detail/video/poster가 있으므로 매핑 타입 일치 — Task A에서 추가됨.)

---

## Task 3: 공개 사이트 DB 연동 (폴백으로 무중단)

**Files:**
- Modify: `src/components/sections/portfolio.tsx` (prop 사용)
- Modify: `src/components/landing-page.tsx` (cases prop 전달)
- Modify: `src/app/page.tsx` (서버 fetch → prop)
- Modify: `src/app/portfolio/[slug]/page.tsx` (DB 조회)
- Modify: `src/app/sitemap.ts` (DB 조회)

- [ ] **Step 1: Portfolio가 cases prop을 받도록 수정**

`src/components/sections/portfolio.tsx`:
- import 변경: `import { portfolioCases } from "@/data/site";` 제거, `import type { Case } from "@/lib/portfolio";` 추가.
- 시그니처: `export function Portfolio({ cases }: { cases: Case[] }) {`
- 내부의 `portfolioCases`를 모두 `cases`로 치환. `const count = cases.length;` `cases.map(...)` `const current = cases[active];`
- 그 외 로직/JSX는 그대로(필드명 동일: slug/industry/title/problem/strategy/result/duration/video/poster).

- [ ] **Step 2: LandingPage가 cases를 받아 전달**

`src/components/landing-page.tsx`:
- 상단에 `import type { Case } from "@/lib/portfolio";`
- 시그니처: `export function LandingPage({ cases }: { cases: Case[] }) {`
- `<Portfolio />` → `<Portfolio cases={cases} />`

- [ ] **Step 3: 홈 page.tsx에서 서버 조회 후 전달**

`src/app/page.tsx` 전체를 교체:
```tsx
import { LandingPage } from "@/components/landing-page";
import { getPublishedCases } from "@/lib/portfolio";

export default async function Home() {
  const cases = await getPublishedCases();
  return <LandingPage cases={cases} />;
}
```

- [ ] **Step 4: 케이스 상세 페이지 DB 조회**

`src/app/portfolio/[slug]/page.tsx` 수정:
- `import { portfolioCases } from "@/data/site";` 제거.
- `import { getPublishedCases, getCaseBySlug } from "@/lib/portfolio";` 추가.
- `generateStaticParams`:
  ```ts
  export async function generateStaticParams() {
    const cases = await getPublishedCases();
    return cases.map((c) => ({ slug: c.slug }));
  }
  ```
- `generateMetadata`와 페이지 본문에서 케이스 조회를 `const item = await getCaseBySlug(slug);`로 변경(기존 `getCase(slug)` 동기 헬퍼 제거). 나머지 렌더(필드 동일)는 유지.
- 파일 상단에 `export const dynamicParams = true;` (DB에 나중에 추가된 slug도 on-demand 렌더).

- [ ] **Step 5: sitemap DB 조회**

`src/app/sitemap.ts` 수정: `import { getPublishedCases } from "@/lib/portfolio";` 추가, 포트폴리오 URL을
```ts
const cases = await getPublishedCases();
const caseUrls = cases.map((c) => ({
  url: `${siteUrl}/portfolio/${c.slug}`,
  lastModified: new Date(),
  changeFrequency: "monthly" as const,
  priority: 0.7,
}));
```
로 만들고 반환 배열에 `...caseUrls` 포함. (함수가 async가 되어야 하면 `export default async function sitemap()`로 변경.)

- [ ] **Step 6: Checkpoint**

Run: `npx tsc --noEmit && npm run build`
Expected: 빌드 성공. Supabase env가 없으면 폴백으로 3개 케이스가 그대로 정적 생성됨(라우트 테이블에 `/portfolio/skin-clinic-search` 등 3개). 홈·포트폴리오 동작 동일.
수동: `npm run dev -- -H 0.0.0.0` 후 홈 포트폴리오 덱·`/portfolio/skin-clinic-search` 정상 확인.

---

## Task 4: 인증 미들웨어 + 콜백

**Files:**
- Create: `middleware.ts` (프로젝트 루트)
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: 미들웨어 — 세션 갱신 + /admin 보호**

Create `middleware.ts` (루트):
```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // 환경변수 없으면 인증 불가 → /admin 접근만 차단(로그인 페이지 제외)
  if (!url || !anon) {
    if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith("/admin") && path !== "/admin/login";

  if (isAdminArea) {
    const allowed = (process.env.ADMIN_EMAILS ?? "")
      .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    const email = user?.email?.toLowerCase();
    if (!email || !allowed.includes(email)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
```

- [ ] **Step 2: 매직링크 콜백 라우트**

Create `src/app/auth/callback/route.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/admin/login?error=auth`);
}
```

- [ ] **Step 3: Checkpoint**

Run: `npx tsc --noEmit && npm run build`
Expected: 빌드 성공(미들웨어 컴파일). env 없을 때 `/admin`은 `/admin/login`으로 리다이렉트.

---

## Task 5: 로그인 페이지 + 인증 서버 액션

**Files:**
- Create: `src/app/admin/actions.ts` (인증 액션 부분; CRUD는 Task 7에서 추가)
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: 인증 서버 액션 (requestMagicLink, signOut)**

Create `src/app/admin/actions.ts`:
```ts
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAllowedAdmin } from "@/lib/admin-auth";

export type AuthState = { status: "idle" | "sent" | "error"; message: string };

export async function requestMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { status: "error", message: "이메일을 입력해주세요." };
  if (!isAllowedAdmin(email)) {
    return { status: "error", message: "허용되지 않은 이메일입니다." };
  }
  const supabase = await createSupabaseServerClient();
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/admin` },
  });
  if (error) return { status: "error", message: "발송 실패. 잠시 후 다시 시도해주세요." };
  return { status: "sent", message: "로그인 링크를 이메일로 보냈습니다. 메일함을 확인해주세요." };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

- [ ] **Step 2: 로그인 페이지 (client)**

Create `src/app/admin/login/page.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { requestMagicLink, type AuthState } from "@/app/admin/actions";

const initial: AuthState = { status: "idle", message: "" };

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#18191B] px-5 text-[#F4EFE5]">
      <div className="w-full max-w-sm">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">Admin</p>
        <h1 className="mt-3 font-kr text-2xl font-bold">관리자 로그인</h1>
        <p className="mt-2 font-kr text-sm text-[#8B8B86]">등록된 이메일로 로그인 링크를 보내드립니다.</p>
        <form action={action} className="mt-8 grid gap-4">
          <input
            type="email"
            name="email"
            required
            placeholder="you@dandelionmkt.co.kr"
            className="h-12 border border-[#343437] bg-[#111214] px-4 text-[#F4EFE5] placeholder:text-[#8B8B86] focus:border-[#D6B77A] focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="h-12 bg-[#D6B77A] font-display text-sm uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0] disabled:opacity-60"
          >
            {pending ? "발송 중…" : "로그인 링크 받기"}
          </button>
        </form>
        {state.message ? (
          <p className={`mt-4 font-kr text-sm ${state.status === "error" ? "text-[#D96C63]" : "text-[#8FA88A]"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Checkpoint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 클린. (실제 발송은 Supabase env 필요 — 수동 검증은 Task 9.)

---

## Task 6: 관리자 레이아웃 · 대시보드 · 목록

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/portfolio/page.tsx`

- [ ] **Step 1: 관리자 레이아웃 (상단바 + 로그아웃)**

Create `src/app/admin/layout.tsx`:
```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminEmail } from "@/lib/admin-auth";
import { signOut } from "@/app/admin/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 로그인 페이지는 이 레이아웃을 함께 쓰되 가드에서 제외
  const path = (await headers()).get("x-pathname") ?? "";
  const email = await getAdminEmail();
  // /admin/login 외 영역은 인증 필요(미들웨어가 1차 가드, 여기서 2차)
  if (!email && !path.endsWith("/admin/login")) {
    // 안전망: 미들웨어가 처리하지만 직접 접근 대비
  }
  return (
    <div className="min-h-screen bg-[#18191B] text-[#F4EFE5]">
      <header className="flex items-center justify-between border-b border-[#343437] px-6 py-4">
        <Link href="/admin" className="font-display text-sm uppercase tracking-[0.28em] text-[#D6B77A]">
          Dandelion Admin
        </Link>
        <nav className="flex items-center gap-6 font-display text-xs uppercase tracking-[0.18em]">
          <Link href="/admin/portfolio" className="hover:text-[#D6B77A]">Portfolio</Link>
          <Link href="/" className="text-[#8B8B86] hover:text-[#D6B77A]">사이트 보기</Link>
          {email ? (
            <form action={signOut}>
              <button type="submit" className="text-[#8B8B86] hover:text-[#D96C63]">로그아웃</button>
            </form>
          ) : null}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
```
참고: `x-pathname` 헤더는 없을 수 있으므로 가드는 미들웨어에 의존. 위 안전망 블록은 no-op으로 두되, 로그인 페이지가 자체 `<main>`을 갖고 이 레이아웃 안에 중첩돼도 문제없도록 단순 유지.

- [ ] **Step 2: 대시보드**

Create `src/app/admin/page.tsx`:
```tsx
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
```

- [ ] **Step 3: 포트폴리오 목록**

Create `src/app/admin/portfolio/page.tsx`:
```tsx
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
```

- [ ] **Step 4: Checkpoint**

Run: `npx tsc --noEmit`
Expected: 클린 (Task 7에서 `deleteCase`/`togglePublished`/`reorderCase`/CRUD 액션을 정의하므로, 이 Task의 tsc는 Task 7과 함께 통과시키거나 임시로 액션 시그니처를 먼저 정의한다 — 아래 Step 5 참조).

- [ ] **Step 5: (정합성) actions.ts에 액션 시그니처 스텁 먼저 추가**

Task 7 전에 tsc가 깨지지 않도록, `src/app/admin/actions.ts`에 다음 export를 **미리 추가**(본문은 Task 7에서 채움). 지금은 동작하는 최소 구현:
```ts
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminEmail } from "@/lib/admin-auth";

async function assertAdmin() {
  const email = await getAdminEmail();
  if (!email) throw new Error("unauthorized");
}

export async function togglePublished(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const { data } = await supabase.from("portfolio_cases").select("published").eq("id", id).maybeSingle();
  await supabase.from("portfolio_cases").update({ published: !data?.published }).eq("id", id);
  revalidatePath("/"); revalidatePath("/admin/portfolio");
}

export async function deleteCase(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("portfolio_cases").delete().eq("id", id);
  revalidatePath("/"); revalidatePath("/admin/portfolio");
}

export async function reorderCase(id: string, dir: "up" | "down") {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const { data: all } = await supabase.from("portfolio_cases").select("id,sort_order").order("sort_order", { ascending: true });
  if (!all) return;
  const idx = all.findIndex((r) => r.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return;
  const a = all[idx], b = all[swapIdx];
  await supabase.from("portfolio_cases").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("portfolio_cases").update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath("/"); revalidatePath("/admin/portfolio");
}
```
(이 코드는 Task 5에서 만든 `actions.ts`에 **추가**한다.)

Run: `npx tsc --noEmit`
Expected: 클린.

---

## Task 7: CRUD + 업로드 서버 액션

**Files:**
- Modify: `src/app/admin/actions.ts` (createCase, updateCase, uploadMedia 추가)

- [ ] **Step 1: detail 파싱 + create/update 액션 추가**

`src/app/admin/actions.ts`에 추가:
```ts
import { redirect } from "next/navigation"; // 이미 import돼 있으면 생략

function parseCaseForm(formData: FormData) {
  const headings = formData.getAll("detail_heading").map(String);
  const bodies = formData.getAll("detail_body").map(String);
  const detail = headings
    .map((heading, i) => ({ heading: heading.trim(), body: (bodies[i] ?? "").trim() }))
    .filter((d) => d.heading || d.body);
  const num = (v: FormDataEntryValue | null) => Number(String(v ?? "0")) || 0;
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    industry: String(formData.get("industry") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    problem: String(formData.get("problem") ?? "").trim(),
    strategy: String(formData.get("strategy") ?? "").trim(),
    result: String(formData.get("result") ?? "").trim(),
    duration: String(formData.get("duration") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    detail,
    published: formData.get("published") === "on",
    sort_order: num(formData.get("sort_order")),
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    poster_url: String(formData.get("poster_url") ?? "").trim() || null,
  };
}

export async function createCase(formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const payload = parseCaseForm(formData);
  if (!payload.slug || !payload.title) throw new Error("slug/title required");
  await supabase.from("portfolio_cases").insert(payload);
  revalidatePath("/"); revalidatePath(`/portfolio/${payload.slug}`); revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}

export async function updateCase(id: string, formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const payload = parseCaseForm(formData);
  await supabase.from("portfolio_cases").update(payload).eq("id", id);
  revalidatePath("/"); revalidatePath(`/portfolio/${payload.slug}`); revalidatePath("/admin/portfolio");
  redirect("/admin/portfolio");
}
```

- [ ] **Step 2: 미디어 업로드 액션**

`src/app/admin/actions.ts`에 추가:
```ts
export type UploadResult = { url: string } | { error: string };

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "supabase not configured" };
  const file = formData.get("file") as File | null;
  const slug = String(formData.get("slug") ?? "case").trim() || "case";
  const kind = String(formData.get("kind") ?? "media"); // "video" | "poster"
  if (!file || file.size === 0) return { error: "파일이 없습니다." };
  const maxBytes = kind === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) return { error: "파일이 너무 큽니다." };
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const path = `cases/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("portfolio-media")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) return { error: "업로드 실패." };
  const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
  return { url: data.publicUrl };
}
```

- [ ] **Step 3: Checkpoint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 클린.

---

## Task 8: 케이스 에디터 + 미디어 업로드 위젯 + 에디터 페이지

**Files:**
- Create: `src/components/admin/media-upload.tsx`, `src/components/admin/case-editor.tsx`
- Create: `src/app/admin/portfolio/new/page.tsx`, `src/app/admin/portfolio/[id]/page.tsx`

- [ ] **Step 1: 미디어 업로드 위젯 (client)**

Create `src/components/admin/media-upload.tsx`:
```tsx
"use client";

import { useRef, useState } from "react";
import { uploadMedia, type UploadResult } from "@/app/admin/actions";

export function MediaUpload({
  kind, slug, value, onChange, accept,
}: {
  kind: "video" | "poster";
  slug: string;
  value: string;
  onChange: (url: string) => void;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setBusy(true); setError("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("slug", slug || "case");
    fd.set("kind", kind);
    const res: UploadResult = await uploadMedia(fd);
    setBusy(false);
    if ("url" in res) onChange(res.url);
    else setError(res.error);
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="border border-[#343437] px-4 py-2 font-display text-xs uppercase tracking-[0.16em] text-[#F4EFE5] hover:border-[#D6B77A] disabled:opacity-60"
        >
          {busy ? "업로드 중…" : `${kind === "video" ? "영상" : "포스터"} 업로드`}
        </button>
        {value ? <span className="truncate font-kr text-xs text-[#8FA88A]">업로드됨</span> : <span className="font-kr text-xs text-[#8B8B86]">미설정(폴백 사용)</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
      {kind === "poster" && value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="poster preview" className="h-28 w-auto rounded border border-[#343437] object-cover" />
      ) : null}
      {error ? <p className="font-kr text-xs text-[#D96C63]">{error}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: 케이스 에디터 폼 (client)**

Create `src/components/admin/case-editor.tsx`:
```tsx
"use client";

import { useState } from "react";
import { MediaUpload } from "@/components/admin/media-upload";
import type { CaseDetailBlock } from "@/lib/portfolio";

export type CaseFormValues = {
  slug: string; industry: string; title: string; problem: string; strategy: string;
  result: string; duration: string; summary: string; detail: CaseDetailBlock[];
  published: boolean; sort_order: number; video_url: string; poster_url: string;
};

const empty: CaseFormValues = {
  slug: "", industry: "", title: "", problem: "", strategy: "", result: "", duration: "",
  summary: "", detail: [{ heading: "", body: "" }], published: true, sort_order: 0, video_url: "", poster_url: "",
};

function Field({ label, name, defaultValue, textarea }: { label: string; name: string; defaultValue?: string; textarea?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">{label}</span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={3} className="border border-[#343437] bg-[#111214] p-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      ) : (
        <input name={name} defaultValue={defaultValue} className="h-11 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
      )}
    </label>
  );
}

export function CaseEditor({
  action, initial,
}: {
  action: (formData: FormData) => void;
  initial?: CaseFormValues;
}) {
  const init = initial ?? empty;
  const [slug, setSlug] = useState(init.slug);
  const [detail, setDetail] = useState<CaseDetailBlock[]>(init.detail.length ? init.detail : [{ heading: "", body: "" }]);
  const [videoUrl, setVideoUrl] = useState(init.video_url);
  const [posterUrl, setPosterUrl] = useState(init.poster_url);

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">Slug</span>
          <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="h-11 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
        </label>
        <Field label="Industry(업종)" name="industry" defaultValue={init.industry} />
        <Field label="Title(제목)" name="title" defaultValue={init.title} />
        <Field label="Result(결과)" name="result" defaultValue={init.result} />
        <Field label="Duration(기간)" name="duration" defaultValue={init.duration} />
        <Field label="Sort order" name="sort_order" defaultValue={String(init.sort_order)} />
      </div>
      <Field label="Problem" name="problem" defaultValue={init.problem} textarea />
      <Field label="Strategy" name="strategy" defaultValue={init.strategy} textarea />
      <Field label="Summary(상세 요약)" name="summary" defaultValue={init.summary} textarea />

      {/* 상세 블록 */}
      <div className="grid gap-3">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">상세 글 블록</p>
        {detail.map((block, i) => (
          <div key={i} className="grid gap-2 border border-[#343437] p-3">
            <div className="flex items-center justify-between">
              <input
                name="detail_heading"
                defaultValue={block.heading}
                placeholder="소제목"
                className="h-10 flex-1 border border-[#343437] bg-[#111214] px-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none"
              />
              <button type="button" onClick={() => setDetail(detail.filter((_, j) => j !== i))} className="ml-3 text-[#D96C63]">삭제</button>
            </div>
            <textarea name="detail_body" defaultValue={block.body} rows={3} placeholder="본문" className="border border-[#343437] bg-[#111214] p-3 font-kr text-sm text-[#F4EFE5] focus:border-[#D6B77A] focus:outline-none" />
          </div>
        ))}
        <button type="button" onClick={() => setDetail([...detail, { heading: "", body: "" }])} className="justify-self-start border border-[#343437] px-4 py-2 font-display text-xs uppercase tracking-[0.16em] text-[#D6B77A] hover:bg-[#D6B77A] hover:text-[#111214]">
          + 블록 추가
        </button>
      </div>

      {/* 미디어 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">영상</p>
          <MediaUpload kind="video" slug={slug} value={videoUrl} onChange={setVideoUrl} accept="video/mp4" />
          <input type="hidden" name="video_url" value={videoUrl} />
        </div>
        <div>
          <p className="mb-2 font-display text-[11px] uppercase tracking-[0.2em] text-[#8B8B86]">포스터</p>
          <MediaUpload kind="poster" slug={slug} value={posterUrl} onChange={setPosterUrl} accept="image/*" />
          <input type="hidden" name="poster_url" value={posterUrl} />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="published" defaultChecked={init.published} className="size-4 accent-[#D6B77A]" />
        <span className="font-kr text-sm text-[#F4EFE5]">게시</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" className="bg-[#D6B77A] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#111214] hover:bg-[#E7D2A0]">저장</button>
        <a href="/admin/portfolio" className="border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.16em] text-[#F4EFE5] hover:border-[#D6B77A]">취소</a>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: 새 케이스 페이지**

Create `src/app/admin/portfolio/new/page.tsx`:
```tsx
import { CaseEditor } from "@/components/admin/case-editor";
import { createCase } from "@/app/admin/actions";

export default function NewCasePage() {
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">새 케이스</h1>
      <CaseEditor action={createCase} />
    </div>
  );
}
```

- [ ] **Step 4: 수정 페이지**

Create `src/app/admin/portfolio/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { CaseEditor, type CaseFormValues } from "@/components/admin/case-editor";
import { updateCase } from "@/app/admin/actions";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { CaseDetailBlock } from "@/lib/portfolio";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) notFound();
  const { data } = await supabase.from("portfolio_cases").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const initial: CaseFormValues = {
    slug: data.slug, industry: data.industry, title: data.title, problem: data.problem,
    strategy: data.strategy, result: data.result, duration: data.duration, summary: data.summary ?? "",
    detail: (Array.isArray(data.detail) ? data.detail : []) as CaseDetailBlock[],
    published: data.published, sort_order: data.sort_order,
    video_url: data.video_url ?? "", poster_url: data.poster_url ?? "",
  };

  const action = updateCase.bind(null, id);
  return (
    <div>
      <h1 className="mb-8 font-kr text-2xl font-bold">케이스 수정 — {data.title}</h1>
      <CaseEditor action={action} initial={initial} />
    </div>
  );
}
```

- [ ] **Step 5: Checkpoint**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: 모두 통과. 빌드 라우트 테이블에 `/admin`, `/admin/login`, `/admin/portfolio`, `/admin/portfolio/new`, `/admin/portfolio/[id]`, `/auth/callback` 등장. 미들웨어 컴파일.

---

## Task 9: 통합 검증 (수동 + 빌드)

**Files:** 없음(검증).

- [ ] **Step 1: 빌드/타입/린트 최종 확인**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: 전부 통과. Supabase env 없이도 폴백으로 공개 사이트(홈·`/portfolio/[slug]`·sitemap) 정상 빌드.

- [ ] **Step 2: 폴백 동작 확인(환경변수 없이)**

`npm run dev -- -H 0.0.0.0` → 홈 포트폴리오 덱 + `/portfolio/skin-clinic-search` 정상(정적 폴백). `/admin` 접근 시 `/admin/login`으로 리다이렉트되는지 확인.

- [ ] **Step 3: (사용자) Supabase 연결 후 수동 플로우**

사용자가 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS` 설정 + `supabase/portfolio.sql` 실행 후:
- `/admin/login`에서 허용 이메일로 링크 요청 → 메일 링크 클릭 → `/admin` 진입.
- 새 케이스 생성 + 영상/포스터 업로드 → 저장 → 홈/상세에 반영(revalidate) 확인.
- 미게시 토글 → 공개에서 숨김 확인. 순서 변경 확인. 삭제 확인.
- 비허용 이메일 차단 확인.

- [ ] **Step 4: Checkpoint** — 이상 발견 시 해당 파일 수정 후 Step 1 재실행.

---

## Self-Review (작성자 체크)

**Spec 커버리지:**
- 데이터 모델/RLS/Storage/시드 → Task 1 SQL ✅
- Case 타입 + 폴백 → Task 2 ✅
- 공개 DB 연동(홈/상세/sitemap, prop 전달) → Task 3 ✅
- 인증(미들웨어/콜백/Magic Link/allowlist) → Task 4·5 ✅
- 관리자 레이아웃/대시보드/목록 → Task 6 ✅
- CRUD/업로드/revalidate 액션 → Task 6(스텁)·7 ✅
- 에디터/업로드 위젯/에디터 페이지 → Task 8 ✅
- 검증 → Task 9 ✅
- 폴백/보안(allowlist 재확인, service-role 서버 전용) → 전반 반영 ✅

**플레이스홀더:** 없음(모든 코드 제시). 

**타입 일관성:** `Case`/`CaseDetailBlock`(lib/portfolio.ts) ↔ `CaseFormValues`(case-editor) ↔ 폼 필드명(`detail_heading`/`detail_body`/`video_url`/`poster_url`/`sort_order`/`published`) ↔ `parseCaseForm`(actions) 일치. 액션명(`createCase`/`updateCase`/`deleteCase`/`togglePublished`/`reorderCase`/`uploadMedia`/`requestMagicLink`/`signOut`) 전 Task 일치.

**주의(실행 시):**
- `actions.ts`는 Task 5에서 생성, Task 6 Step 5에서 CRUD 외 액션 추가, Task 7에서 create/update/upload 추가 — 한 파일에 누적되므로 import 중복 없게 병합.
- `admin/layout.tsx`의 `x-pathname` 의존 가드는 안전망(no-op). 실제 보호는 `middleware.ts`.
- 로그인 페이지는 admin 레이아웃 하위지만 미들웨어 matcher에서 `/admin/login`만 통과 허용.
