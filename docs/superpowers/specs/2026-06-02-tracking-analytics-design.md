# 트래킹 링크 + 전환 대시보드 설계 (서브프로젝트 ③④)

**날짜:** 2026-06-02
**범위:** Vercel Web Analytics(전체 방문자) + 자체 트래킹 링크(`?ref=`) 유입 기록 + 문의(lead) 전환 어트리뷰션 + 관리자 분석 대시보드.
**전제:** Phase 1·2·CMS 패턴(인증/`getSupabaseAdmin`/`assertAdmin`/`leads` 테이블/`revalidatePath`) 재사용. 공개 폼 액션은 `src/app/actions.ts`의 `submitLead`.

## 1. 결정
- 전체 방문자/페이지뷰/기기 = **Vercel Web Analytics**(`@vercel/analytics`) — 별도 인프라 없음, Vercel 대시보드에서 확인.
- 링크 유입 + 전환 = **자체 DB + `/admin/analytics`**.
- 링크 형식 = `?ref=코드`(쿼리 파라미터, 어느 페이지든 동작).
- 폴백: Supabase 없으면 빈 대시보드/무동작(사이트 정상).

## 2. 데이터 (Supabase) — `supabase/tracking.sql`
- `tracking_links`(id uuid pk, code text unique not null, label text not null default '', created_at timestamptz default now()).
- `link_visits`(id uuid pk, code text not null, path text, created_at timestamptz default now(), index(code), index(created_at)).
- `alter table public.leads add column if not exists ref text;`
- RLS: 두 테이블 모두 `enable rls` + service_role 전체 권한. (공개 SELECT 불필요 — 기록/조회 모두 서버 service_role.)
- `link_visits` INSERT는 서버 라우트가 service_role로 수행.

## 3. Vercel Analytics
- `npm i @vercel/analytics`.
- 루트 `layout.tsx` `<body>`에 `<Analytics />`(`@vercel/analytics/react`) 추가. (사용자가 Vercel 프로젝트 Analytics 탭에서 활성화)

## 4. 유입 기록 + 쿠키
- API 라우트 `src/app/api/track/route.ts` (GET): `?ref=code` → service_role로 `link_visits` insert(code, path=referer경로 optional) + 응답에 `ref` 쿠키 설정(httpOnly, path=/, maxAge 30일) + 1x1 또는 204 반환.
- 클라이언트 `src/components/ref-tracker.tsx`(client, 루트 layout에 렌더): `usePathname`/`useSearchParams`로 현재 URL `?ref` 확인 → 있으면 `sessionStorage`로 세션당 1회만 `fetch('/api/track?ref='+code, {keepalive:true})`. `/admin` 경로 제외.
- 봇 최소 필터: 세션당 1회 + (선택) UA에 'bot' 포함 시 스킵(서버).

## 5. 전환 어트리뷰션
- `src/app/actions.ts` `submitLead`: `cookies()`에서 `ref` 읽어 payload에 `ref` 포함해 `leads` insert. (쿠키 없으면 null.)

## 6. 관리자 — `/admin/analytics`
- 서버 컴포넌트: 
  - `tracking_links` 전체 + 각 code의 방문수(`link_visits` count where code) + 전환수(`leads` count where ref=code) → 표(라벨·코드·전체 URL·방문·전환·전환율). 
  - 기간 집계: `link_visits.created_at`·`leads.created_at`를 최근치 조회해 JS로 **오늘/7일/30일/올해** 방문·문의 수 타일.
  - 차트 라이브러리 없이 숫자 타일 + 간단 막대(div width %).
- 링크 생성 폼 → 서버 액션 `createTrackingLink(formData)`(label, code; code 유니크). 삭제 `deleteTrackingLink(id)`.
- 액션은 `src/app/admin/actions.ts`에 추가(assertAdmin + service_role + revalidatePath('/admin/analytics')).
- 관리자 네비/대시보드에 "분석" 추가.

## 7. 파일 구조
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

## 8. 검증
- tsc + Vercel 빌드. 수동: `/admin/analytics`에서 링크 생성→그 `?ref=` URL로 접속(다른 브라우저)→방문 기록↑→그 세션에서 문의 제출→전환↑. 기간 타일 동작. Vercel Analytics 탭에 방문 데이터.

## 9. 범위 밖
- 정교한 세션/유니크 방문자 정의, UTM 다차원, 실시간, IP/지역, 봇 정밀 차단, 그래프 라이브러리, 링크 단축(`/r/code`)·QR.
