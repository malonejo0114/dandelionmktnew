# 트래킹 링크 + 전환 대시보드 Implementation Plan (③④)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development.

**Goal:** Vercel Web Analytics(전체 방문자) + `?ref=` 트래킹 링크 유입 기록 + 문의 전환 어트리뷰션 + `/admin/analytics` 대시보드.

**Architecture:** `tracking_links`/`link_visits` 테이블 + `leads.ref`. `?ref=`로 들어오면 client `RefTracker`가 `/api/track`(service_role insert + ref 쿠키) 호출. `submitLead`가 ref 쿠키를 lead에 저장. `/admin/analytics`가 링크별 방문·전환·기간 집계. 방문자 총량은 `@vercel/analytics`.

**Tech Stack:** Next.js 15, Supabase, Tailwind, @vercel/analytics.

**사전 메모:** git repo — 커밋. 검증 `npx tsc --noEmit`(+ 새 파일은 `npx eslint <files>`로 lint 확인 — 로컬 `npm run lint`는 iCloud로 ETIMEDOUT). 최종 빌드는 Vercel. SQL은 사용자 실행. 폴백: Supabase 없으면 무동작/빈 대시보드.

---

## File Structure
```
supabase/tracking.sql                    (신규)
package.json                             (수정: @vercel/analytics)
src/app/layout.tsx                       (수정: <Analytics/> + <RefTracker/>)
src/components/ref-tracker.tsx           (신규)
src/app/api/track/route.ts               (신규)
src/app/actions.ts                       (수정: submitLead ref)
src/app/admin/actions.ts                 (수정: createTrackingLink/deleteTrackingLink)
src/app/admin/analytics/page.tsx         (신규)
src/app/admin/layout.tsx, page.tsx       (수정: 분석 네비/타일)
```

---

## Task AT1: deps + SQL + Vercel Analytics

**Files:** Modify package.json(npm), `src/app/layout.tsx`; Create `supabase/tracking.sql`

- [ ] **Step 1: 설치** — `cd /Users/johanjin/Documents/homedandel && npm install @vercel/analytics`

- [ ] **Step 2: `supabase/tracking.sql`**
```sql
create table if not exists public.tracking_links (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.link_visits (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  path text,
  created_at timestamptz not null default now()
);
create index if not exists link_visits_code_idx on public.link_visits (code);
create index if not exists link_visits_created_idx on public.link_visits (created_at);

alter table public.leads add column if not exists ref text;

alter table public.tracking_links enable row level security;
alter table public.link_visits enable row level security;
drop policy if exists "service role manages tracking_links" on public.tracking_links;
create policy "service role manages tracking_links" on public.tracking_links
for all to service_role using (true) with check (true);
drop policy if exists "service role manages link_visits" on public.link_visits;
create policy "service role manages link_visits" on public.link_visits
for all to service_role using (true) with check (true);
```

- [ ] **Step 3: layout.tsx — `<Analytics/>` + `<RefTracker/>`**
READ `src/app/layout.tsx`. Add imports:
```ts
import { Analytics } from "@vercel/analytics/react";
import { RefTracker } from "@/components/ref-tracker";
```
In `RootLayout` `<body>`, after `<FloatingKakao .../>` (and before `<div className="noise-overlay" .../>`), add:
```tsx
        <RefTracker />
        <Analytics />
```

- [ ] **Step 4: Checkpoint + commit**
Run: `npx tsc --noEmit` → 클린. (RefTracker는 다음 Task에서 생성 — 이 Task 단독 tsc는 RefTracker import 때문에 실패할 수 있으니, **Step 3의 layout 변경은 RefTracker가 생성된 뒤(AT2) 한꺼번에 검증**해도 됨. 순서상 RefTracker 파일을 먼저 만들고 싶으면 AT2 Step1을 먼저 수행.)
구현자 메모: 이 Task에서 `src/components/ref-tracker.tsx`도 함께 생성(아래 AT2 Step1 코드)하여 tsc를 통과시킨 뒤 커밋해도 된다.
`git add -A && git commit -m "feat(track): @vercel/analytics + tracking SQL + layout 연결"`

---

## Task AT2: RefTracker + /api/track + 전환 어트리뷰션

**Files:** Create `src/components/ref-tracker.tsx`, `src/app/api/track/route.ts`; Modify `src/app/actions.ts`

- [ ] **Step 1: RefTracker (client)** — `src/components/ref-tracker.tsx`
```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RefTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    const key = `ref-tracked:${ref}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/track?ref=${encodeURIComponent(ref)}&path=${encodeURIComponent(pathname)}`, { keepalive: true }).catch(() => {});
  }, [pathname]);
  return null;
}
```

- [ ] **Step 2: `/api/track` route** — `src/app/api/track/route.ts`
```ts
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("ref");
  const path = request.nextUrl.searchParams.get("path") ?? "/";
  const res = new NextResponse(null, { status: 204 });
  if (!code) return res;
  const ua = request.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|preview|facebookexternalhit/i.test(ua)) return res;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("link_visits").insert({ code, path });
  }
  res.cookies.set("ref", code, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  return res;
}
```

- [ ] **Step 3: submitLead ref 첨부** — `src/app/actions.ts`
READ the file. Add import at top: `import { cookies } from "next/headers";`
In `submitLead`, before building `payload`, add: `const ref = (await cookies()).get("ref")?.value ?? null;`
Add `ref,` into the `payload` object (alongside `source`).
(`leads.ref` 컬럼은 AT1 SQL에서 추가됨.)

- [ ] **Step 4: Checkpoint + commit**
Run: `npx tsc --noEmit` → 클린.
새 파일 lint: `npx eslint src/components/ref-tracker.tsx src/app/api/track/route.ts src/app/actions.ts` → 에러 없음.
`git add -A && git commit -m "feat(track): RefTracker + /api/track + lead 전환 어트리뷰션"`

---

## Task AT3: 트래킹 링크 액션 + /admin/analytics

**Files:** Modify `src/app/admin/actions.ts`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`; Create `src/app/admin/analytics/page.tsx`

- [ ] **Step 1: 액션 APPEND** — `src/app/admin/actions.ts` (기존 assertAdmin/getSupabaseAdmin/revalidatePath 재사용)
```ts
// === Tracking ===
export async function createTrackingLink(formData: FormData) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase not configured");
  const label = String(formData.get("label") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
  if (!code) throw new Error("code required");
  const { error } = await supabase.from("tracking_links").insert({ code, label });
  if (error) throw new Error(`생성 실패: ${error.message}`);
  revalidatePath("/admin/analytics");
}

export async function deleteTrackingLink(id: string) {
  await assertAdmin();
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("tracking_links").delete().eq("id", id);
  revalidatePath("/admin/analytics");
}
```

- [ ] **Step 2: 대시보드 페이지** — `src/app/admin/analytics/page.tsx`
```tsx
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
```

- [ ] **Step 3: 관리자 네비/대시보드에 "분석"**
- `src/app/admin/layout.tsx` nav: 문의함 다음에 `<Link href="/admin/analytics" className="hover:text-[#D6B77A]">분석</Link>`
- `src/app/admin/page.tsx` 빠른 링크에: `<Link href="/admin/analytics" className="inline-block border border-[#343437] px-6 py-3 font-display text-xs uppercase tracking-[0.18em] text-[#F4EFE5] hover:border-[#D6B77A]">분석 →</Link>`

- [ ] **Step 4: Checkpoint + commit**
Run: `npx tsc --noEmit` → 클린. lint: `npx eslint src/app/admin/analytics/page.tsx` → 에러 없음(내부 링크 `<a>` 금지 — 위 코드엔 없음).
`git add -A && git commit -m "feat(track): 트래킹 링크 액션 + /admin/analytics 대시보드"`

---

## Task AT4: 검증 + 배포
- [ ] `npx tsc --noEmit` → 클린. `npx eslint src/app/layout.tsx src/components/ref-tracker.tsx src/app/api/track/route.ts src/app/admin/analytics/page.tsx` → 에러 없음.
- [ ] `git push origin main` → Vercel 빌드 success(최종 게이트).
- [ ] (사용자) `supabase/tracking.sql` 실행 + Vercel 프로젝트 Analytics 탭 활성화. `/admin/analytics`에서 링크 생성 → 그 `?ref=` URL 접속 → 유입↑ → 문의 제출 → 전환↑ 확인.

---

## Self-Review
- 커버리지: Vercel Analytics(AT1)·유입기록/쿠키/전환(AT2)·링크액션/대시보드/네비(AT3)·검증배포(AT4) ✅
- 타입 일관성: `tracking_links`/`link_visits`/`leads.ref` ↔ 액션/라우트/대시보드 컬럼명 일치. `RefTracker`(client, /admin 제외) ↔ `/api/track`(service_role) ↔ `submitLead` ref 쿠키.
- 빌드 주의: 내부 네비는 `<Link>`만(no-html-link-for-pages). `useSearchParams` 대신 `window.location.search` 사용(Suspense 불필요). 새 파일은 반드시 `npx eslint`로 사전 확인(로컬 npm lint는 iCloud ETIMEDOUT).
- 폴백: Supabase 없으면 무동작/빈 대시보드. submitLead ref는 쿠키 없으면 null.
