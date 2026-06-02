# 관리자(Admin) — 포트폴리오 관리 (Phase 1) 설계

**날짜:** 2026-06-02
**대상:** Dandelion Effect 사이트에 콘텐츠 관리자 도입
**범위(Phase 1):** 인증 + 포트폴리오 카드 CRUD + 케이스 상세 글 + 미디어 업로드 + 공개 사이트 DB 연동.
**다음 단계(범위 밖):** Hero/About/Framework/CTA/저널 등 섹션 텍스트 편집 (별도 spec). 단, 이번 설계는 그 확장을 염두에 둔다.

---

## 1. 결정 사항 (확정)

- **1단계 = 포트폴리오만.** 섹션 텍스트 편집은 후속.
- **인증 = Supabase Auth Magic Link.** 허용 이메일(`ADMIN_EMAILS`)만.
- **미디어 = Supabase Storage 업로드.**
- **공개 렌더 = on-demand revalidation** (정적 유지 + 저장 시 즉시 갱신).
- **폴백:** Supabase 미설정/빈 데이터 시 기존 `src/data/site.ts`의 `portfolioCases` 정적 데이터를 사용 (개발·안전망).

## 2. 데이터 모델 (Supabase Postgres)

### 테이블 `public.portfolio_cases`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid pk default gen_random_uuid() | |
| slug | text unique not null | 라우트 `/portfolio/{slug}` |
| industry | text not null | 카드 분류/업종 |
| title | text not null | 카드 제목 |
| problem | text not null | |
| strategy | text not null | |
| result | text not null | |
| duration | text not null | |
| summary | text not null default '' | 상세 페이지 요약 |
| detail | jsonb not null default '[]' | `[{heading, body}]` 섹션 배열 |
| video_url | text | Storage 공개 URL, null이면 폴백 |
| poster_url | text | Storage 공개 URL, null이면 폴백 |
| sort_order | int not null default 0 | 카드 정렬 |
| published | boolean not null default true | 공개 여부 |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() | 트리거로 갱신 |

### RLS 정책
- 공개 읽기: `published = true` 행만 `anon`/`authenticated`가 SELECT 가능.
- 쓰기(insert/update/delete): `service_role`만 (서버 액션에서 service-role 클라이언트 사용).

### Storage
- 버킷 `portfolio-media` (public read). 경로: `cases/{slug}/video.*`, `cases/{slug}/poster.*`.
- 업로드는 서버 액션에서 service-role로 수행.

### 마이그레이션/시드
- `supabase/portfolio.sql`: 테이블 + 인덱스(slug, sort_order) + updated_at 트리거 + RLS + 버킷 생성 안내.
- 시드: 기존 3개 케이스(skin-clinic-search, education-funnel, local-brand-system)를 INSERT (video_url/poster_url은 null → /hero.mp4 폴백).

## 3. 인증 (Supabase Auth · Magic Link)

- 의존성 추가: `@supabase/ssr`.
- env 추가: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAILS`(쉼표구분). 기존 `SUPABASE_SERVICE_ROLE_KEY` 유지.
- 클라이언트 헬퍼:
  - `src/lib/supabase/server.ts` — 쿠키 기반 서버 클라이언트(`createServerClient`).
  - `src/lib/supabase/client.ts` — 브라우저 클라이언트(`createBrowserClient`).
  - 기존 `src/lib/supabase.ts`의 `getSupabaseAdmin()`(service-role)는 유지·재사용.
- 흐름:
  1. `/admin/login`: 이메일 입력 → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: /auth/callback } })`.
  2. `/auth/callback/route.ts`: `exchangeCodeForSession` 후 `/admin`로 리다이렉트.
  3. `middleware.ts`: 세션 새로고침 + `/admin/*` 보호. 세션 없으면 `/admin/login`. 세션 이메일이 `ADMIN_EMAILS`에 없으면 로그아웃 처리 후 거부.
- `/admin/login`은 미들웨어 보호에서 제외.

## 4. 관리자 UI (`/admin`)

라우트 그룹 `src/app/admin/`:
- `admin/login/page.tsx` — 이메일 입력 폼(서버 액션 `requestMagicLink`), 발송 안내 메시지.
- `admin/layout.tsx` — 인증된 레이아웃(상단바: 로고, 로그아웃). 다크 테마, 간결한 관리자 톤(공개 사이트와 구분되되 브랜드 컬러 사용).
- `admin/page.tsx` — 대시보드: 포트폴리오 목록으로 안내 + 요약(케이스 수, 미게시 수).
- `admin/portfolio/page.tsx` — 케이스 목록: 행마다 제목/업종/게시상태/순서. 액션: 새 케이스, 수정, 삭제(확인), 게시토글, 순서 ↑/↓.
- `admin/portfolio/new/page.tsx` 및 `admin/portfolio/[id]/page.tsx` — 에디터(공용 `CaseEditor` 컴포넌트):
  - 필드: slug, industry, title, problem, strategy, result, duration, summary, published, sort_order.
  - 상세 블록: `detail` 배열 편집 — 블록 추가/삭제/위·아래 이동, 각 블록 heading+body(textarea).
  - 미디어: 영상 업로드(mp4) + 포스터 업로드(jpg/png), 현재 값 미리보기, 교체/삭제.
  - 저장/취소. 검증 에러 표시.

### 서버 액션 (`src/app/admin/actions.ts`, "use server")
- `requestMagicLink(formData)` — OTP 발송.
- `signOut()`.
- `createCase(formData)` / `updateCase(id, formData)` — service-role insert/update. 저장 후 `revalidatePath('/')` + `revalidatePath('/portfolio/${slug}')` + `revalidatePath('/admin/portfolio')`.
- `deleteCase(id)` — 삭제 + revalidate.
- `togglePublished(id)`, `reorderCase(id, dir)`.
- `uploadMedia(caseSlug, kind, file)` — Storage 업로드, 공개 URL 반환, 행 업데이트.
- 모든 쓰기 액션은 호출 시 세션 이메일이 `ADMIN_EMAILS`에 포함되는지 재검증(미들웨어 우회 방지).

## 5. 공개 사이트 연동

- `src/lib/portfolio.ts`:
  - `getPublishedCases(): Promise<Case[]>` — Supabase에서 published=true, sort_order 정렬. 미설정/에러/빈 결과 시 `site.ts`의 `portfolioCases` 폴백(동일 형태로 매핑, video/poster 기본값 `/hero.mp4`·`/hero-poster.jpg`).
  - `getCaseBySlug(slug)` — 단건. 폴백 동일.
  - `Case` 타입을 한 곳에 정의(기존 site.ts 형태와 호환: slug/industry/title/problem/strategy/result/duration/summary/detail/video/poster).
- 홈 `src/app/page.tsx`(서버): `const cases = await getPublishedCases()` → `<LandingPage cases={cases} />`.
  - `LandingPage`(client)는 `cases` prop을 받아 `<Portfolio cases={cases} />`로 전달. `Portfolio`는 더 이상 `portfolioCases`를 직접 import하지 않고 prop 사용.
- `src/app/portfolio/[slug]/page.tsx`: `getCaseBySlug` 사용. `generateStaticParams`는 `getPublishedCases()`의 slug. `export const revalidate = false`(정적) + 저장 시 on-demand revalidate로 갱신.
- `src/app/sitemap.ts`: 정적 `portfolioCases` 대신 `getPublishedCases()` 사용(폴백 포함).

## 6. 파일 구조 (신규/수정)

```
supabase/portfolio.sql                         (신규: 스키마+RLS+시드)
.env.example                                   (수정: anon key, ADMIN_EMAILS)
package.json                                   (수정: @supabase/ssr)
middleware.ts                                  (신규: 세션 + /admin 보호)
src/lib/supabase/server.ts                     (신규)
src/lib/supabase/client.ts                     (신규)
src/lib/portfolio.ts                           (신규: 조회 + 폴백 + Case 타입)
src/app/auth/callback/route.ts                 (신규)
src/app/admin/layout.tsx                       (신규)
src/app/admin/login/page.tsx                   (신규)
src/app/admin/page.tsx                         (신규)
src/app/admin/portfolio/page.tsx               (신규)
src/app/admin/portfolio/new/page.tsx           (신규)
src/app/admin/portfolio/[id]/page.tsx          (신규)
src/app/admin/actions.ts                       (신규: 서버 액션)
src/components/admin/case-editor.tsx           (신규: 공용 에디터 폼)
src/components/admin/media-upload.tsx          (신규: 업로드 위젯)
src/app/page.tsx                               (수정: cases fetch → props)
src/components/landing-page.tsx                (수정: cases prop 전달)
src/components/sections/portfolio.tsx          (수정: portfolioCases import 제거 → cases prop)
src/app/portfolio/[slug]/page.tsx              (수정: DB 조회)
src/app/sitemap.ts                             (수정: DB 조회)
```

`src/data/site.ts`의 `portfolioCases`는 **폴백/시드 출처로 유지**.

## 7. 에러 처리 / 보안

- 서버 액션: 입력 검증(필수 필드, slug 유니크/형식), 실패 시 폼에 메시지.
- 모든 admin 쓰기 액션은 세션+이메일 allowlist 재확인.
- Storage 업로드: 확장자/크기 제한(영상 ≤ 50MB, 이미지 ≤ 5MB), 콘텐츠 타입 검증.
- service-role 키는 서버에서만 사용(클라이언트 노출 금지).
- 폴백 경로는 읽기 전용(쓰기는 항상 DB).

## 8. 검증 방식

- 단위 테스트보다: `tsc`/`lint`/`build` 통과 + 수동 플로우 검증.
- 수동 시나리오: (1) 로그인 링크 발송→콜백→/admin 진입, (2) 새 케이스 생성+영상 업로드, (3) 공개 홈/상세에 즉시 반영(revalidate), (4) 미게시 토글 시 공개에서 숨김, (5) 비허용 이메일 차단, (6) Supabase 미설정 시 폴백으로 사이트 정상.

## 9. 범위 밖 (YAGNI / 후속)

- 섹션(Hero/About/Framework/CTA) 텍스트 편집 — Phase 2.
- 저널(블로그) 관리 — 현재 MDX 유지, 후속.
- 다중 사용자 권한/역할, 감사 로그, 이미지 자동 포스터 생성, 드래그 정렬(이번엔 ↑/↓ 버튼).
