# Dandelion Effect 웹사이트 — 인수인계 문서 (HANDOFF)

> 이 파일 하나로 프로젝트 전체(무엇이 어디에 있고 어떻게 동작하는지, 운영/배포/주의사항)를 이해할 수 있도록 정리했습니다. 다음 작업자(사람/AI)는 여기부터 읽으세요.

최종 업데이트: 2026-06-02

---

## 1. 한 줄 요약
주식회사 **민들레효과(Dandelion Effect)** 마케팅 에이전시의 프리미엄 원페이지 사이트 + 블로그 + **관리자(CMS)**.
- 공개: 다크 "Cinematic Editorial" 랜딩(영상 Hero·포트폴리오 카드덱·블로그·문의폼) + 아이보리 블로그.
- 관리자(`/admin`): 포트폴리오·사이트 콘텐츠·SEO·블로그(CMS)·문의함·트래킹/분석.
- 데이터/인증/스토리지 = **Supabase**. 호스팅 = **Vercel**. 코드 = GitHub `malonejo0114/dandelionmktnew`.

## 2. 기술 스택
- **Next.js 15** (App Router, Turbopack), **React 19**, **TypeScript**.
- **Tailwind v4** (globals.css에 `@theme`/`@utility`).
- **GSAP ScrollTrigger** + **Lenis**(부드러운 스크롤), **framer-motion**(포트폴리오 카드덱), **TipTap v2**(블로그 WYSIWYG).
- **Supabase** (Postgres + Auth + Storage), **@supabase/ssr**(쿠키 세션), **@supabase/supabase-js**.
- **@vercel/analytics**(방문자 집계).
- 폰트: 영문/디스플레이 = Cormorant Garamond(next/font), 국문 = **Pretendard**(globals.css의 CDN import). Tailwind 유틸 `font-display`(세리프), `font-kr`(고딕).

## 3. 핵심 원칙 (꼭 이해)
- **Supabase 폴백:** 거의 모든 데이터 조회는 Supabase가 없거나 비어도 **기본값/정적 데이터로 폴백**해 사이트가 깨지지 않는다.
  - 콘텐츠 기본값 = `src/data/content.ts`(`defaultContent`), 포트폴리오 폴백 = `src/data/site.ts`(`portfolioCases`), 블로그 폴백 = `content/columns/*.mdx`(`src/lib/blog.ts`).
- **쓰기는 전부 서버에서 service_role + `assertAdmin()`** 게이트. 클라이언트는 절대 service-role 키를 보지 않는다.
- **미디어 업로드는 브라우저 → Supabase Storage 직접 업로드(서명 URL)**. 서버 액션 본문(Vercel 4.5MB 한도)을 우회. (서버는 서명 URL만 발급)
- **편집 후 즉시 반영:** 관리자 저장 시 `revalidatePath('/')` 등 on-demand revalidation.

## 4. 디렉터리 지도 (무엇이 어디에)

### 공개 사이트
- `src/app/page.tsx` — 홈(서버). `getPublishedCases()`+`getSiteContent()`+`getPublishedPosts()` 조회 → `LandingPage`에 prop 전달.
- `src/components/landing-page.tsx` — 홈 조립(client) + GSAP 컨텍스트. 각 섹션에 콘텐츠 prop 전달.
- `src/components/sections/*` — Hero/Marquee/About/Framework/Portfolio/Journal/GrowthCTA/SiteHeader/SiteFooter. **텍스트는 전부 `content` prop**(하드코딩 아님).
  - `hero.tsx` — 영상 배경(키워드 회전), `hero-background.tsx`(public/hero.mp4 + 오버레이).
  - `portfolio.tsx` — framer-motion 카드덱(루프·모바일 플립·"더 자세히 보기"→`/portfolio/[slug]`).
  - `journal.tsx` — 최신 블로그 3개(대표 이미지 카드).
- `src/app/portfolio/[slug]/page.tsx` — 케이스 상세(서버, DB 폴백, JSON-LD 없음).
- `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx` — 블로그 목록/상세(서버, DB 폴백, **BlogPosting+FAQPage JSON-LD**, 본문 HTML 렌더).
- `src/app/layout.tsx` — 루트. **동적 `generateMetadata()`**(SEO를 DB에서), `<FloatingKakao>`, `<RefTracker>`, `<Analytics>` 렌더.
- `src/app/sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `rss.xml/route.ts` — SEO 부속.
- `src/components/floating-kakao.tsx` — 우하단 카카오 상담 버튼(`/admin` 숨김, URL 없으면 숨김).
- `src/components/lead-form.tsx` — 문의 폼(→ `src/app/actions.ts`의 `submitLead`).
- `src/components/ref-tracker.tsx` — `?ref=` 유입 추적(클라, `/api/track` 호출).

### 관리자 (`/admin/*`, 인증 필요)
- `src/middleware.ts` — **`src/`에 있어야 함**(이 프로젝트는 src dir). `/admin/*` 보호(세션+ADMIN_EMAILS allowlist), 미설정 시 로그인으로.
- `src/app/admin/layout.tsx` — 관리자 셸(네비: Portfolio/콘텐츠/블로그/문의함/분석/로그아웃).
- `src/app/admin/login/page.tsx` — **이메일+비밀번호 로그인**(매직링크에서 전환됨).
- `src/app/admin/page.tsx` — 대시보드(케이스/미게시/문의 수 + 빠른 링크).
- `src/app/admin/portfolio/*` — 포트폴리오 케이스 CRUD(목록/new/[id]). 에디터 `src/components/admin/case-editor.tsx` + `media-upload.tsx`(영상/포스터).
- `src/app/admin/content/page.tsx` — **사이트 섹션 텍스트 + SEO** 편집. 에디터 `src/components/admin/site-content-editor.tsx`.
- `src/app/admin/blog/*` — 블로그 CRUD. 에디터 `src/components/admin/post-editor.tsx` + `rich-text-editor.tsx`(TipTap).
- `src/app/admin/leads/page.tsx` — 문의함(보기+삭제).
- `src/app/admin/analytics/page.tsx` — 트래킹 링크 생성 + 링크별 유입/문의/전환율 + 기간 타일.
- `src/app/admin/actions.ts` — **관리자 서버 액션 전부**(로그인/로그아웃, 포트폴리오 CRUD, `createUploadUrl`, 콘텐츠 저장, 문의 삭제, 블로그 CRUD+`createBlogUploadUrl`, 트래킹 링크). 모두 `assertAdmin()`.
- `src/app/api/track/route.ts` — `?ref=` 방문 기록(service_role insert) + `ref` 쿠키 설정.
- `src/app/auth/callback/route.ts` — (구) 매직링크 콜백. 현재 비밀번호 로그인이라 미사용이나 무해.

### 데이터/유틸 (`src/lib`, `src/data`)
- `src/lib/supabase.ts` — `getSupabaseAdmin()`(service-role, 서버 전용).
- `src/lib/supabase/server.ts`·`client.ts` — `@supabase/ssr` 쿠키 클라이언트(인증/브라우저 업로드용).
- `src/lib/admin-auth.ts` — `assertAdmin`은 아님(그건 actions.ts). `getAdminEmail()`/`isAllowedAdmin()`(ADMIN_EMAILS). env 없으면 안전하게 null.
- `src/lib/portfolio.ts` — `getPublishedCases`/`getCaseBySlug`(+site.ts 폴백). `Case` 타입.
- `src/lib/site-content.ts` — `getSiteContent()`(DB ⊕ defaultContent 머지).
- `src/lib/posts.ts` — `getPublishedPosts`/`getPostBySlug`(+MDX 폴백). `Post`/`Faq` 타입.
- `src/lib/blog.ts` — 파일시스템 MDX 리더(폴백 소스).
- `src/data/content.ts` — `SiteContent` 타입 + `defaultContent`(섹션 텍스트·SEO 기본값). **사이트 문구의 단일 소스.**
- `src/data/site.ts` — `portfolioCases`(폴백/시드), `columnPreviews`(레거시), `navItems`/`frameworkItems`/`marqueeWords`(레거시·미사용; 실데이터는 content.ts).
- `src/lib/motion.ts` — GSAP reveal/hero intro.

## 5. 데이터 모델 (Supabase) — `supabase/*.sql`
각 SQL은 **Supabase 대시보드 SQL 에디터에서 직접 실행**(코드가 자동 실행하지 않음).
- `leads.sql` — `leads`(문의). 컬럼: name, phone, email, industry, channel, budget, challenge, marketing_consent, source, created_at + **`ref`(트래킹, tracking.sql에서 추가)**.
- `portfolio.sql` — `portfolio_cases`(slug/industry/title/problem/strategy/result/duration/summary/detail(jsonb)/video_url/poster_url/sort_order/published) + `portfolio-media` 버킷.
- `site-content.sql` — `site_content`(단일 행 `id='singleton'`, `content jsonb`). 섹션 텍스트·SEO·카카오URL 전부 여기.
- `blog.sql` — `posts`(slug/title/category/status/published_at/excerpt/cover_url/content_html/summary/faqs(jsonb)/seo_title/seo_description/reading_time) + `blog-media` 버킷.
- `tracking.sql` — `tracking_links`(code/label), `link_visits`(code/path/created_at), `leads.ref` 컬럼 추가.
- RLS 공통: 공개 SELECT는 published/제한적, 쓰기는 service_role. Storage 버킷은 public read + 서명 URL 업로드.

**Storage 버킷:** `portfolio-media`(영상/포스터), `blog-media`(블로그 이미지). 둘 다 public read.

## 6. 인증 흐름
- 비밀번호 로그인: `/admin/login` → `signInWithPassword`(actions.ts) → `@supabase/ssr` 쿠키 세션 → `/admin`.
- 보호: `src/middleware.ts`가 `/admin/*`(로그인 제외)에서 세션 확인 + 이메일이 `ADMIN_EMAILS`에 있는지 검사.
- 관리자 계정은 Supabase Auth에 존재해야 함(현재 `disk_hj@naver.com`). 비밀번호 재설정은 Supabase admin API(`/auth/v1/admin/users/{id}` PUT, service-role)로 가능.

## 7. 환경변수 (`.env.local`, Vercel Project Settings)
```
NEXT_PUBLIC_SITE_URL=https://dandelionmkt.co.kr   # 메타/sitemap 기준
NEXT_PUBLIC_SUPABASE_URL=...                       # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                  # anon (공개 가능)
SUPABASE_URL=...                                   # 동일 URL
SUPABASE_SERVICE_ROLE_KEY=...                      # 🔒 시크릿(서버 전용)
SUPABASE_LEADS_TABLE=leads
ADMIN_EMAILS=disk_hj@naver.com                     # 관리자 허용 이메일(쉼표 구분)
```
- `.env.local`은 git 제외(gitignored). Vercel에는 동일 값을 Environment Variables(Production·Preview)로 등록.

## 8. 배포 / 운영
- GitHub `main` 푸시 → **Vercel 자동 배포**. 라이브: https://dandelionmktnew.vercel.app
- **방문자 분석:** Vercel 프로젝트 → Analytics 탭(활성화 필요). 링크별 전환은 `/admin/analytics`.
- 커스텀 도메인(`dandelionmkt.co.kr`)은 아직 미연결(Vercel Domains에서 추가 가능).

## 9. ⚠️ 알아둘 함정/주의 (반복해서 겪은 것)
1. **iCloud Drive 위치(`~/Documents/homedandel`)**: dev 부팅이 매우 느리고(최대 2분+), 로컬 `npm run build`/`npm run lint`가 **ETIMEDOUT/행**으로 자주 실패. → **검증은 `npx tsc --noEmit`** + **새 파일은 `npx eslint <파일들>`**로 하고, **최종 빌드는 Vercel**로 판단. (가능하면 프로젝트를 iCloud 밖으로 이동 권장.)
2. **`no-html-link-for-pages`**: 내부 페이지 이동에 `<a href="/...">` 쓰면 **Vercel 빌드 실패**. 반드시 `next/link`의 `<Link>` 사용. (`/rss.xml` 같은 라우트핸들러나 외부 링크는 `<a>` 허용.)
3. **Vercel 4.5MB 본문 한도**: 큰 파일은 서버 액션으로 못 올림 → **서명 URL 직접 업로드**(이미 적용: `createUploadUrl`/`createBlogUploadUrl` + `media-upload.tsx`/`rich-text-editor.tsx`).
4. **Vercel 자동배포 트리거 누락**: 가끔 푸시해도 배포가 안 잡힘 → **빈 커밋**(`git commit --allow-empty`) 푸시로 재유도.
5. **iCloud " 2" 중복 파일**(`page 2.tsx` 등)이 `.next`/소스에 생겨 타입 에러 유발 → `.gitignore`에 `* 2.*` 제외, 생기면 삭제 + `.next` 정리.
6. **미들웨어 위치**: src dir 프로젝트라 `src/middleware.ts`여야 동작(루트 X).

## 10. 활성화 체크리스트(신규 환경/DB일 때)
Supabase SQL 에디터에서 순서대로 실행: `leads.sql` → `portfolio.sql` → `site-content.sql` → `blog.sql` → `tracking.sql`. 그 뒤 env 채우고 관리자 계정 비밀번호 설정. (안 해도 폴백으로 공개 사이트는 동작.)

## 11. 설계/계획 문서 (맥락이 필요하면)
`docs/superpowers/specs/*` (설계), `docs/superpowers/plans/*` (구현 계획). 기능별로 날짜+주제로 정리됨(리디자인, 포트폴리오 관리자, 콘텐츠 관리자, 문의함+SEO, 카카오 버튼, 블로그 CMS, 트래킹/분석).

## 12. 구현 완료 기능 요약
- [x] 사이트 리디자인(Cinematic Editorial) + 로고 + 영상 Hero
- [x] 포트폴리오 카드덱(루프/모바일 플립/케이스 상세페이지)
- [x] 관리자: 인증(비밀번호) + 포트폴리오 CRUD + 미디어 업로드
- [x] 사이트 섹션 텍스트 + 전역 SEO 관리자 편집
- [x] 문의함(보기/삭제) + 대시보드
- [x] 카카오 상담 플로팅 버튼
- [x] 블로그 CMS(TipTap WYSIWYG, 대표/본문 이미지, 요약, FAQ, 글별 SEO, BlogPosting/FAQPage JSON-LD)
- [x] 트래킹 링크(`?ref=`) + 문의 전환 어트리뷰션 + `/admin/analytics` + Vercel Analytics

## 13. 다음에 할 만한 것(미구현/선택)
- 커스텀 도메인 연결, 문의 이메일/슬랙 알림(Resend 등), 본문 HTML sanitize, 트래킹 단축링크/QR·세분 분석, iCloud 밖 이동, 매직링크 콜백 코드 제거.
