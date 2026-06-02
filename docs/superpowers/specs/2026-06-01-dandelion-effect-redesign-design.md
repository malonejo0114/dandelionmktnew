# Dandelion Effect — 웹사이트 전면 재디자인 설계

**날짜:** 2026-06-01
**대상:** 주식회사 민들레효과 (Dandelion Effect) 마케팅 에이전시 사이트
**목표:** 기존 빌드의 비주얼이 "프리미엄 성장 컨설팅" 기대에 못 미침 → 같은 브랜드/콘텐츠/기술 스택 위에서 비주얼·컴포넌트 레이어를 **전면 재구축**한다.

---

## 1. 아트 디렉션 — "Cinematic Editorial"

A(시네마틱 무대)와 B(에디토리얼 그리드)를 합친 방향.

- **무대(A):** 깊은 검정 배경, 미세 그리드, 떠다니는 씨앗 입자, 넓은 여백, 골드 씰
- **편집(B):** 비대칭 그리드, 초대형 영문 콘덴스드 오버라인, 얇은 골드 룰, 인덱스 번호, 잡지형 긴장감
- **레퍼런스:** Apple × 럭셔리 필름 + Instrument × Basic Agency
- **피할 것:** 스타트업/SaaS 톤, 네온, 블루 그라데이션, 과한 글래스모피즘, 카드 속 카드

## 2. 타이포그래피 (확정: 절충안 C)

- **영문 / 라벨 / 인덱스 / 디스플레이:** Cormorant Garamond (세리프). 모먼트 강조엔 Playfair Display 보조 가능.
- **국문 헤드라인 / 본문 / UI:** Pretendard (고딕). 또렷·모던·고가독.
- 기존의 국문 세리프(Noto Serif KR) 헤드라인은 **고딕(Pretendard)으로 대체**한다.
- 타입 스케일: Hero 56–84px(데스크탑)/34–48px(모바일), 섹션 타이틀 36–52px, 본문 16–18px, 라벨 11–13px(자간 큼).

## 3. 컬러 시스템 (기존 유지)

| 역할 | Hex |
|---|---|
| Background | `#18191B` |
| Surface | `#111214` |
| Gold | `#D6B77A` |
| Light Gold | `#E7D2A0` |
| Text | `#F4EFE5` |
| Sub Text | `#8B8B86` |
| Border | `#343437` |
| Light section bg (Journal) | `#F4EFE5` / text `#111214` |

비율: 다크 60% / 아이보리·포슬린 20% / 보더 12% / 골드 8%.

## 4. 배경(Hero) — 영상 슬롯

- **사용자가 직접 영상 파일을 제작/제공할 예정.** 현재 단계에서는 영상을 넣지 않는다.
- 지금은 영상 자리에 **임시 다크 배경**(미세 그리드 + 미니멀 CSS 입자 + 라디얼 그라데이션)을 둔다.
- 구조: Hero 최상단에 `<HeroBackground>` 슬롯 컴포넌트. 추후 `<video>` 한 줄 교체로 전환 가능하도록 분리. 항상 다크 오버레이 + 그레인 + 정지 폴백 전제.
- `prefers-reduced-motion` 존중: 모션/입자 비활성화.

## 5. 기술 스택 (유지)

- Next.js 15 (App Router, Turbopack), React 19, TypeScript
- Tailwind v4, GSAP ScrollTrigger, Lenis(부드러운 스크롤)
- Supabase(리드 폼 저장), MDX(저널/블로그)
- 기존 `src/data/site.ts` 콘텐츠, `src/components/lead-form.tsx`, `src/lib/*`, MDX 블로그 라우트 **재사용**. 비주얼/레이아웃 컴포넌트만 재작성.

## 6. 섹션별 설계

각 섹션은 컴포넌트 단위로 분리하여 독립적으로 이해/수정 가능하게 한다. (현재 단일 `landing-page.tsx`가 비대 → 섹션별 파일로 분할)

### Header
상단 에디토리얼 바. 좌측 골드 씰 + 워드마크, 중앙 한글 법인명, 우측 메뉴 + Contact. 스크롤 시 높이·배경 농도 축소. 모바일은 햄버거 → 풀스크린 오버레이.

### 01 — Hero
- `<HeroBackground>`(영상 슬롯, 현재 임시 다크) + 비대칭 2열 그리드
- 영문 콘덴스드 오버라인 ("Structure that spreads")
- 국문 고딕 헤드라인: `브랜드가 / [회전 키워드] 구조를 / 설계합니다.`
- 키워드 회전: 검색되는 → 퍼지는 → 전환되는 → 쌓이는 (골드 강조 + 언더라인)
- 우측 키워드 인덱스 레일(01–04, 활성 행 골드). 모바일은 헤드라인 아래 2×2 그리드
- 서포팅 카피 + Primary CTA(무료 성장 진단 받기) / Secondary CTA(포트폴리오 보기)
- 하단 골드 룰. CTA는 첫 화면에서 항상 보이게.
- 애니메이션: 로고 페이드 → 헤드라인 라인별 reveal → 키워드 전환 → 미세 패럴랙스

### Marquee (Hero ↔ About 사이 디바이더)
얇은 상하 골드/보더 띠. SEARCH·SPREAD·CONVERT·AUTOMATE·BRAND SYSTEM·GROWTH STRUCTURE 키워드(`marqueeWords`)가 좌→우로 흐름. 영문 콘덴스드, 골드 톤. 절제된 한 줄.

### 02 — About Us
좌측 거대 국문 선언문("우리는 광고를 운영하는 회사가 아닙니다 / 브랜드가 성장하고 확산되는 구조를 설계합니다"), 우측 골드 세로 룰 단락 + 보조 영문. 넓은 여백, 인덱스 번호. fade-up 스태거.

### 03 — Framework
풀폭 행(row) 4개. 좌측 거대 인덱스(01–04) + 영문 콘덴스드(SEARCH/SPREAD/CONVERT/AUTOMATE) + 국문 제목/설명. 스크롤 순차 reveal, hover 시 컬러 반전(아이보리 배경). 콘텐츠는 `frameworkItems`.

### 04 — Portfolio
케이스 파일 형식 (`portfolioCases`). 좌측 추상 비주얼(씨앗 모티프 + 미세 그리드, hover 줌) + 우측 Industry/Problem/Strategy/Result/Duration 행. Result는 골드 강조. hover 시 골드 보더/라인 reveal.

### 05 — Journal
다크와 대비되는 웜 아이보리(`#F4EFE5`) 섹션. 카테고리(SEO/Branding/Marketing/Landing Page/Automation), 에디토리얼 카드 그리드(썸네일·카테고리·제목·날짜). hover: 이미지 줌 + 제목 하이라이트 + 골드 언더라인. MDX 블로그(`/blog`)로 연결.

### 06 — Growth Diagnosis CTA
조용한 진단 신청. 좌측 헤드라인("지금의 마케팅 구조를 진단해보세요") + 설명, 우측 다크 폼. 필드: 이름·연락처·이메일·업종·운영 채널·현재 고민(+ 개인정보 수집·이용 동의 체크박스, 마케팅 수신 동의는 선택 분리). 기존 `lead-form.tsx`/Supabase 재사용. 성공 메시지 표시. 컴플라이언스 문구(과장 금지, Meta 공식 제휴 오해 금지) 포함.

### Footer
얇은 골드 룰, 워드마크 + 태그라인, Journal/RSS/Contact 링크, 법인 정보·개인정보처리방침. 미니멀.

## 7. 컴포넌트 구조 (제안)

```
src/components/sections/
  site-header.tsx
  hero.tsx
  hero-background.tsx   ← 영상 슬롯 (현재 임시 다크)
  marquee.tsx
  about.tsx
  framework.tsx
  portfolio.tsx
  journal.tsx
  growth-cta.tsx
  site-footer.tsx
src/components/landing-page.tsx  ← 위 섹션들을 조립 + GSAP 컨텍스트
```

기존 `landing-page.tsx`의 거대 단일 파일을 섹션별로 분할한다.

## 8. 모션 원칙 (GSAP + Lenis)

- 전역: Lenis 부드러운 스크롤, ScrollTrigger 기반 에디토리얼 reveal(블러+y), 미세 패럴랙스
- Hero: 헤드라인 라인별 reveal, 키워드 전환, 입자/패럴랙스
- Framework: 순차 reveal + 인덱스 강조
- Portfolio: 이미지 스케일 / 마스크 reveal
- Journal: 카드 스태거
- 모든 모션은 `prefers-reduced-motion`에서 비활성화

## 9. 접근성 / 품질 기준

- 컬러 대비 WCAG AA 목표 (sub text는 라벨 용도로 한정)
- 시맨틱 헤딩 계층, 키보드 포커스 가시화(골드 링)
- 이미지 alt, 폼 라벨 연결
- 반응형: 모바일(≤768) / 태블릿 / 데스크탑(≥1024)

## 10. 범위 밖 (YAGNI)

- 실제 Hero 배경 영상 제작 (사용자가 별도 제공)
- 새 블로그 글 작성 (기존 3편 유지)
- CMS, 다국어, 다크/라이트 토글
- 백엔드/Supabase 스키마 변경
