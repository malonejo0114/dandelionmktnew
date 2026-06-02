# Dandelion Effect 재디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 Next.js 사이트의 비주얼·레이아웃 레이어를 "Cinematic Editorial" 아트 디렉션으로 전면 재구축한다.

**Architecture:** 기존 스택(Next.js 15 / GSAP / Lenis / Supabase / MDX)과 콘텐츠 데이터(`src/data/site.ts`), 리드 폼(`lead-form.tsx`), MDX 블로그는 유지한다. 비대한 단일 `landing-page.tsx`를 섹션별 컴포넌트(`src/components/sections/*`)로 분할하고, 폰트(국문 Pretendard 고딕 + 영문 Cormorant 세리프)·디자인 토큰·모션을 새 방향으로 교체한다. Hero 배경은 추후 사용자가 제공할 영상으로 교체 가능한 `<HeroBackground>` 슬롯으로 분리하고, 현재는 임시 다크 배경(그리드+입자+그라데이션)을 넣는다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, GSAP ScrollTrigger, Lenis, Pretendard(CDN), Cormorant Garamond(next/font).

---

## 사전 메모 (중요)

- **Git 미초기화:** 이 프로젝트는 git 저장소가 아니다. 각 Task 끝의 단계는 `git commit` 대신 **Checkpoint**(빌드/렌더/시각 확인)로 처리한다. 원하면 시작 전에 `git init`만 따로 수행해도 된다.
- **검증 방식:** 마케팅 페이지 특성상 단위 테스트보다 (1) `npm run build` 통과, (2) `npx tsc --noEmit` 타입 통과, (3) `npm run lint` 통과, (4) 로컬 렌더 + 스크린샷 시각 확인이 핵심 검증이다. 각 섹션 Task는 dev 서버에서 해당 섹션 렌더를 시각 확인한다.
- **시각 확인 도구:** `npm run dev`(localhost:3000) 후 Claude Preview(`mcp__Claude_Preview__*`) 또는 Playwright 스크린샷으로 데스크탑(1440) + 모바일(390) 확인.
- **데이터 출처:** 카피/케이스/칼럼은 `src/data/site.ts`에 이미 정의됨. 새 카피를 임의 창작하지 말고 이 파일을 사용한다.

---

## File Structure

```
src/app/layout.tsx                         ← 수정: Pretendard 추가, 폰트 변수 정리
src/app/globals.css                        ← 수정: 토큰/유틸/모션 helper 교체
src/components/landing-page.tsx            ← 재작성: 섹션 조립 + GSAP 컨텍스트
src/components/sections/site-header.tsx    ← 신규
src/components/sections/hero-background.tsx← 신규 (영상 슬롯)
src/components/sections/hero.tsx           ← 신규
src/components/sections/marquee.tsx        ← 신규
src/components/sections/about.tsx          ← 신규
src/components/sections/framework.tsx      ← 신규
src/components/sections/portfolio.tsx      ← 신규
src/components/sections/journal.tsx        ← 신규
src/components/sections/growth-cta.tsx     ← 신규 (lead-form 재사용)
src/components/sections/site-footer.tsx    ← 신규
src/lib/motion.ts                          ← 신규: 공용 GSAP reveal 헬퍼
```

재사용(수정 없음): `src/data/site.ts`, `src/components/lead-form.tsx`, `src/components/dandelion-mark.tsx`, `src/components/smooth-scroll.tsx`, `src/components/ui/*`, `src/app/actions.ts`, `src/lib/*`, `src/app/blog/*`.

---

## Task 1: 폰트 & 디자인 토큰 기반 교체

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Pretendard CDN을 globals.css 최상단에 추가하고 폰트 유틸을 고딕 기준으로 정리**

`src/app/globals.css` 1번째 줄 `@import "tailwindcss";` **위**에 Pretendard 변수 폰트 import 추가:

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css");
```

같은 파일 `@theme inline` 블록에서 폰트 정의를 아래로 교체 (국문 기본 = Pretendard 고딕, 디스플레이 = Cormorant 세리프):

```css
  --font-sans: "Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-display: var(--font-cormorant), "Times New Roman", serif;
  --font-kr: "Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif;
```

(`--font-condensed`, `--font-serif-kr` 줄은 삭제한다. 더 이상 Oswald/Noto Serif 헤드라인을 쓰지 않는다.)

`@utility font-display { ... }`는 유지. `@utility font-condensed`와 `@utility font-serif-kr` 블록은 아래 새 유틸로 교체:

```css
@utility font-display {
  font-family: var(--font-cormorant), "Times New Roman", serif;
}

@utility font-kr {
  font-family: "Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif;
  letter-spacing: -0.03em;
}
```

`body` 폰트도 Pretendard 우선으로:

```css
  body {
    /* ...기존 background 유지... */
    font-family: "Pretendard Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif;
  }
```

- [ ] **Step 2: layout.tsx에서 불필요한 폰트 제거, Cormorant만 next/font로 유지**

`src/app/layout.tsx`의 import와 폰트 선언을 아래로 교체:

```tsx
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
```

`<html>` className을 아래로 교체 (Noto/Oswald 변수 제거):

```tsx
    <html lang="ko" className={`${cormorant.variable} dark`}>
```

- [ ] **Step 3: 새 CSS 유틸리티/배경 헬퍼 추가**

`src/app/globals.css` 하단(`@media (prefers-reduced-motion)` 위)에 추가:

```css
/* Cinematic Editorial helpers */
.editorial-grid {
  background-image:
    linear-gradient(rgba(244, 239, 229, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(244, 239, 229, 0.035) 1px, transparent 1px);
  background-size: 84px 84px;
}

.gold-underline {
  position: relative;
}
.gold-underline::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.18em;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, #d6b77a, transparent);
}

.hero-glow {
  text-shadow: 0 0 14px rgba(231, 210, 160, 0.35), 0 0 40px rgba(214, 183, 122, 0.16);
}

@keyframes seedDrift {
  0%, 100% { transform: translate(0, 0); opacity: 0.25; }
  50% { transform: translate(10px, -22px); opacity: 0.85; }
}
```

- [ ] **Step 4: Checkpoint — 빌드/타입/렌더 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 없음 (단, 아직 `landing-page.tsx`가 옛 `font-serif-kr`/`font-condensed` 클래스를 참조하면 무시 가능 — Task 12에서 교체됨. lint만 통과하면 됨.)

Run: `npm run build`
Expected: 빌드 성공. (옛 유틸 클래스는 Tailwind v4에서 미정의 시 그냥 무시되므로 빌드는 통과한다.)

---

## Task 2: HeroBackground 슬롯 컴포넌트 (영상 자리 = 임시 다크)

**Files:**
- Create: `src/components/sections/hero-background.tsx`

- [ ] **Step 1: 임시 다크 배경 컴포넌트 작성 (영상은 추후 드롭인)**

```tsx
"use client";

const SEEDS = [
  [18, 30, 3, 0], [74, 24, 2, 1.2], [62, 66, 3, 0.6], [30, 74, 2, 1.8],
  [88, 52, 2, 0.3], [44, 16, 2, 2.1], [12, 58, 3, 0.9], [80, 80, 2, 1.5],
  [52, 88, 2, 0.4], [68, 40, 3, 1.1], [24, 46, 2, 1.7], [92, 18, 2, 0.7],
] as const;

/**
 * Hero 배경 슬롯.
 * 현재: 임시 다크(그리드 + 미세 입자 + 라디얼 그라데이션 + 그레인 오버레이).
 * 추후: 아래 placeholder 위치에 <video> 한 줄을 넣으면 영상 배경으로 교체된다.
 *   <video autoPlay muted loop playsInline poster="/hero-poster.jpg"
 *     className="absolute inset-0 h-full w-full object-cover">
 *     <source src="/hero.webm" type="video/webm" />
 *   </video>
 * 그 위에 .hero-overlay(다크 오버레이)는 그대로 두어 가독성을 보장한다.
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* === 영상 슬롯 (현재 비어있음) === */}

      {/* 임시 다크 배경 */}
      <div className="editorial-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(214,183,122,0.12),transparent_42%),radial-gradient(circle_at_50%_120%,#111214,transparent_55%)]" />
      {SEEDS.map(([left, top, size, delay], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#F4EFE5] shadow-[0_0_10px_rgba(244,239,229,0.6)] motion-reduce:hidden"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `seedDrift ${5 + (i % 4) * 0.8}s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
      {/* 다크 오버레이 (영상 교체 시에도 유지) */}
      <div className="hero-overlay absolute inset-0 bg-[linear-gradient(180deg,rgba(17,18,20,0.25),rgba(17,18,20,0.78))]" />
    </div>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과 (컴포넌트는 Task 4에서 사용).

---

## Task 3: SiteHeader

**Files:**
- Create: `src/components/sections/site-header.tsx`

- [ ] **Step 1: 에디토리얼 상단 바 + 모바일 풀스크린 오버레이 작성**

요구사항: 좌측 골드 씰(`DandelionMark`) + 워드마크 / 중앙 한글 법인명(데스크탑) / 우측 nav(`navItems`) + Contact 버튼. 스크롤 시 배경 농도·높이 축소(상태 `scrolled`). 모바일은 햄버거 → 풀스크린 오버레이.

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DandelionMark } from "@/components/dandelion-mark";
import { navItems } from "@/data/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`flex items-center justify-between border-b border-[#343437] px-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-8 ${
          scrolled ? "h-14 bg-[#111214]/90 backdrop-blur-md" : "h-[72px] bg-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-3" aria-label="Dandelion Effect home">
          <DandelionMark className="size-7" />
          <span className="font-display text-base uppercase tracking-[0.28em] text-[#F4EFE5]">
            Dandelion Effect
          </span>
        </Link>

        <span className="hidden font-kr text-xs tracking-[0.1em] text-[#8B8B86] lg:block">
          주식회사 민들레효과
        </span>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display text-xs uppercase tracking-[0.22em] text-[#F4EFE5]/80 transition-colors hover:text-[#D6B77A]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#cta"
            className="border border-[#D6B77A] px-5 py-2 font-display text-xs uppercase tracking-[0.2em] text-[#D6B77A] transition-colors hover:bg-[#D6B77A] hover:text-[#111214]"
          >
            Contact
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col gap-[5px] lg:hidden"
          aria-label="메뉴 열기"
        >
          <span className="h-px w-6 bg-[#F4EFE5]" />
          <span className="h-px w-6 bg-[#F4EFE5]" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#111214] px-6 py-6 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-base uppercase tracking-[0.28em] text-[#F4EFE5]">
              Dandelion Effect
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="메뉴 닫기" className="text-2xl text-[#F4EFE5]">
              ×
            </button>
          </div>
          <nav className="mt-16 flex flex-col gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-kr text-3xl text-[#F4EFE5]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="mt-4 border border-[#D6B77A] px-6 py-4 text-center font-display text-sm uppercase tracking-[0.2em] text-[#D6B77A]"
            >
              무료 성장 진단
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 4: Hero

**Files:**
- Create: `src/components/sections/hero.tsx`

- [ ] **Step 1: Hero 작성 (영문 오버라인 + 국문 고딕 헤드라인 키워드 회전 + 우측 인덱스 레일 + CTA)**

키워드: `검색되는 / 퍼지는 / 전환되는 / 쌓이는`. 2.4초 간격 회전, 활성 키워드는 골드+언더라인, 우측 레일 활성 행 강조. 모바일은 레일을 헤드라인 아래 2×2 그리드로.

```tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DandelionMark } from "@/components/dandelion-mark";
import { HeroBackground } from "@/components/sections/hero-background";

const KEYWORDS = [
  { kr: "검색되는", en: "Search" },
  { kr: "퍼지는", en: "Spread" },
  { kr: "전환되는", en: "Convert" },
  { kr: "쌓이는", en: "Automate" },
] as const;

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % KEYWORDS.length), 2400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-5 pb-16 pt-28 sm:px-8">
      <HeroBackground />

      <div className="relative z-10 mx-auto grid w-full max-w-[1500px] gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div data-hero-mark className="mb-7 flex items-center gap-3">
            <DandelionMark className="size-9" />
            <span className="font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">
              Premium Growth Agency · Seoul
            </span>
          </div>

          <p data-hero-line className="mb-5 font-display text-sm uppercase tracking-[0.42em] text-[#8B8B86]">
            Structure that spreads
          </p>

          <h1 className="font-kr text-[2.4rem] font-light leading-[1.16] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3.6rem] lg:text-[4.6rem]">
            <span data-hero-line className="block">브랜드가</span>
            <span data-hero-line className="block">
              <span className="hero-glow gold-underline font-medium text-[#E7D2A0]">
                {KEYWORDS[active].kr}
              </span>{" "}
              구조를
            </span>
            <span data-hero-line className="block">설계합니다.</span>
          </h1>

          <p data-hero-line className="mt-7 max-w-xl font-kr text-base leading-7 text-[#A7A39B] sm:text-lg sm:leading-8">
            단순한 노출이 아니라, 상품과 업장의 본질에 맞는 구조를 설계해 브랜드의 지속 가능한 성장을 만듭니다.
          </p>

          {/* 모바일 키워드 그리드 */}
          <div className="mt-8 grid grid-cols-2 gap-px border border-[#343437] bg-[#343437] lg:hidden">
            {KEYWORDS.map((k, i) => (
              <div
                key={k.en}
                className={`flex items-center justify-between px-4 py-3 ${
                  active === i ? "bg-[#1d1e22] text-[#F4EFE5]" : "bg-[#15161a] text-[#5e5d59]"
                }`}
              >
                <span className="font-kr text-sm">{`0${i + 1} ${k.kr}`}</span>
                <span className={active === i ? "text-[#D6B77A]" : ""}>›</span>
              </div>
            ))}
          </div>

          <div data-hero-cta className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#cta"
              className="group inline-flex h-[52px] items-center justify-between bg-[#D6B77A] px-6 font-display text-sm uppercase tracking-[0.16em] text-[#111214] transition-colors hover:bg-[#E7D2A0] sm:min-w-60"
            >
              무료 성장 진단 받기
              <ArrowRight className="ml-4 size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#portfolio"
              className="group inline-flex h-[52px] items-center justify-between border border-[#343437] px-6 font-display text-sm uppercase tracking-[0.16em] text-[#F4EFE5] transition-colors hover:border-[#D6B77A] hover:text-[#D6B77A] sm:min-w-52"
            >
              포트폴리오 보기
              <ArrowUpRight className="ml-4 size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* 데스크탑 키워드 인덱스 레일 */}
        <div data-hero-rail className="hidden min-w-[200px] border-l border-[#343437] pl-6 lg:block">
          {KEYWORDS.map((k, i) => (
            <div
              key={k.en}
              className={`flex items-center justify-between gap-8 border-b border-[#343437]/60 py-4 font-display text-sm uppercase tracking-[0.18em] transition-colors duration-500 ${
                active === i ? "text-[#F4EFE5]" : "text-[#5e5d59]"
              }`}
            >
              <span>{`0${i + 1}`}</span>
              <span className={active === i ? "font-kr text-[#D6B77A]" : "font-kr"}>{k.kr}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-5 bottom-8 z-10 h-px bg-[linear-gradient(90deg,#d6b77a,transparent)] sm:inset-x-8" />
    </section>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 5: Marquee

**Files:**
- Create: `src/components/sections/marquee.tsx`

- [ ] **Step 1: 키워드 흐름 띠 작성** (`marqueeWords` 사용, GSAP는 Task 12에서 `[data-marquee-track]`로 구동)

```tsx
import { marqueeWords } from "@/data/site";

export function Marquee() {
  const words = [...marqueeWords, ...marqueeWords];
  return (
    <div className="overflow-hidden border-y border-[#343437] bg-[#111214] py-4">
      <div data-marquee-track className="flex w-max items-center gap-10 whitespace-nowrap">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="flex items-center gap-10">
            <span className="font-display text-2xl uppercase tracking-[0.18em] text-[#D6B77A]/80 sm:text-4xl">
              {word}
            </span>
            <span className="text-[#343437]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 6: About

**Files:**
- Create: `src/components/sections/about.tsx`

- [ ] **Step 1: About 작성** (좌측 거대 국문 선언문 + 우측 골드 세로 룰 단락. `data-reveal`로 스크롤 등장)

```tsx
export function About() {
  return (
    <section id="about" className="relative bg-[#18191B] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div data-reveal>
          <p className="mb-7 font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">
            — 01 / About Us
          </p>
          <h2 className="font-kr text-[2rem] font-light leading-[1.28] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3rem] lg:text-[3.6rem]">
            우리는 광고를 운영하는<br />회사가 아닙니다.
            <span className="mt-5 block font-medium text-[#E7D2A0]">
              브랜드가 성장하고 확산되는<br />구조를 설계합니다.
            </span>
          </h2>
        </div>

        <div data-reveal className="grid gap-8 border-l border-[#D6B77A]/45 pl-7">
          <p className="font-display text-xl italic leading-8 text-[#DDD6CA]">
            Great brands grow through systems, not luck.
          </p>
          <p className="font-kr text-base leading-8 text-[#A7A39B]">
            민들레효과는 검색, 콘텐츠, 전환, 고객 관계를 하나의 구조로 연결합니다. 광고 집행의 양보다 중요한 것은 브랜드가 스스로 검색되고, 기억되고, 상담으로 이어지는 흐름입니다.
          </p>
          <div className="grid grid-cols-2 gap-px bg-[#343437]">
            {["Search", "Content", "Conversion", "Relationship"].map((p) => (
              <div key={p} className="bg-[#111214] p-5">
                <p className="font-display text-xl uppercase tracking-[0.16em] text-[#F4EFE5]">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 7: Framework

**Files:**
- Create: `src/components/sections/framework.tsx`

- [ ] **Step 1: Framework 작성** (`frameworkItems` 사용. 풀폭 행 4개, 좌측 거대 인덱스 + 영문 코드 + 국문. `data-framework-item`로 순차 등장, hover 반전)

```tsx
import { frameworkItems } from "@/data/site";

export function Framework() {
  return (
    <section id="framework" className="bg-[#111214] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-16 grid gap-6 border-b border-[#343437] pb-10 lg:grid-cols-[0.42fr_1fr]">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">— 02 / Framework</p>
          <h2 className="font-display text-5xl uppercase leading-[0.95] tracking-[0.02em] text-[#F4EFE5] sm:text-7xl lg:text-8xl">
            Growth System
          </h2>
        </div>

        <div className="grid gap-px bg-[#343437]">
          {frameworkItems.map((item, i) => (
            <article
              key={item.code}
              data-framework-item
              className="group grid gap-6 bg-[#111214] p-6 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#F4EFE5] hover:text-[#111214] md:grid-cols-[0.16fr_0.32fr_1fr] md:p-9"
            >
              <p className="font-display text-6xl leading-none text-[#D6B77A] group-hover:text-[#8F6E32]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <p className="font-display text-2xl uppercase tracking-[0.14em] text-[#F4EFE5] group-hover:text-[#111214]">
                  {item.code}
                </p>
                <h3 className="mt-3 font-kr text-xl font-medium text-[#D6B77A] group-hover:text-[#8F6E32]">
                  {item.title}
                </h3>
              </div>
              <p className="max-w-3xl font-kr leading-8 text-[#A7A39B] group-hover:text-[#4E4A43]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 8: Portfolio

**Files:**
- Create: `src/components/sections/portfolio.tsx`

- [ ] **Step 1: Portfolio 작성** (`portfolioCases` 사용. 케이스 파일: 좌측 추상 비주얼 + 우측 Industry/Problem/Strategy/Result/Duration. Result 골드 강조. hover 줌/골드 보더)

```tsx
import { DandelionMark } from "@/components/dandelion-mark";
import { portfolioCases } from "@/data/site";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid gap-4 bg-[#111214] p-6 md:grid-cols-[0.26fr_1fr] md:p-8">
      <p className="font-display text-xs uppercase tracking-[0.24em] text-[#8B8B86]">{label}</p>
      <p className={strong ? "font-kr text-xl font-medium text-[#D6B77A]" : "font-kr leading-8 text-[#CFC8BC]"}>
        {value}
      </p>
    </div>
  );
}

export function Portfolio() {
  return (
    <section id="portfolio" className="bg-[#18191B] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-14 grid gap-6 lg:grid-cols-[0.42fr_1fr] lg:items-end">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">— 03 / Portfolio</p>
          <div>
            <h2 className="font-kr text-[2.2rem] font-light leading-[1.12] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3.4rem]">
              단순 결과가 아니라,<br />비즈니스 케이스로 증명합니다.
            </h2>
            <p className="mt-6 max-w-2xl font-kr leading-8 text-[#A7A39B]">
              각 프로젝트는 업종의 본질, 병목, 전략, 결과를 하나의 성장 구조로 해석합니다.
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {portfolioCases.map((item, i) => (
            <article
              key={item.title}
              data-reveal
              className="group grid overflow-hidden border border-[#343437] bg-[#111214] transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#D6B77A]/70 lg:grid-cols-[0.44fr_1fr]"
            >
              <div className="relative min-h-72 overflow-hidden bg-[radial-gradient(circle_at_30%_30%,rgba(214,183,122,0.22),transparent_12rem),#15161a]">
                <div className="editorial-grid absolute inset-0 opacity-60 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" />
                <div className="absolute inset-8 border border-[#F4EFE5]/12" />
                <DandelionMark className="absolute left-10 top-10 size-12 opacity-70" />
                <p className="absolute bottom-10 left-10 font-display text-5xl uppercase tracking-[0.12em] text-[#F4EFE5]">
                  {`Case 0${i + 1}`}
                </p>
              </div>
              <div className="grid gap-px bg-[#343437]">
                <Row label="Industry" value={item.industry} strong />
                <Row label="Problem" value={item.problem} />
                <Row label="Strategy" value={item.strategy} />
                <Row label="Result" value={item.result} strong />
                <Row label="Duration" value={item.duration} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 9: Journal

**Files:**
- Create: `src/components/sections/journal.tsx`

- [ ] **Step 1: Journal 작성** (웜 아이보리 섹션. `columnPreviews` 사용. 카드 그리드, hover 다크 반전 + 골드 언더라인. `/blog/[slug]` 링크)

```tsx
import Link from "next/link";
import { columnPreviews } from "@/data/site";

export function Journal() {
  return (
    <section id="journal" className="bg-[#F4EFE5] px-5 py-24 text-[#111214] sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-14 grid gap-6 lg:grid-cols-[0.42fr_1fr] lg:items-end">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#8F6E32]">— 04 / Journal</p>
          <div>
            <h2 className="font-display text-5xl uppercase leading-[0.95] tracking-[0.03em] sm:text-7xl lg:text-8xl">
              Editorial Authority
            </h2>
            <p className="mt-6 max-w-2xl font-kr text-base leading-8 text-[#59564F]">
              SEO 유입을 위한 글도 가벼운 팁이 아니라, 대표자가 의사결정을 내릴 수 있는 전략 문서처럼 설계합니다.
            </p>
          </div>
        </div>

        <div className="grid gap-px bg-[#D9CCB5] md:grid-cols-3">
          {columnPreviews.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              data-reveal
              className="group grid min-h-[460px] grid-rows-[180px_1fr] bg-[#F4EFE5] transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#111214] hover:text-[#F4EFE5]"
            >
              <div className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(17,18,20,0.82),rgba(17,18,20,0.28)),radial-gradient(circle_at_28%_24%,rgba(214,183,122,0.42),transparent_9rem),#18191b]">
                <p className="absolute bottom-6 left-6 font-display text-5xl uppercase tracking-[0.1em] text-[#F4EFE5]">
                  {`0${i + 1}`}
                </p>
              </div>
              <div className="flex flex-col justify-between p-7">
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.24em] text-[#8F6E32] group-hover:text-[#D6B77A]">
                    {post.category} · {post.date}
                  </p>
                  <h3 className="mt-7 font-kr text-xl font-medium leading-snug">{post.title}</h3>
                </div>
                <div className="mt-10 h-px w-full bg-[#D6B77A]/55 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-2/3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 10: GrowthCTA (lead-form 재사용)

**Files:**
- Create: `src/components/sections/growth-cta.tsx`

- [ ] **Step 1: CTA 섹션 작성** (좌측 헤드라인+설명+컴플라이언스, 우측 기존 `LeadForm`)

```tsx
import { LeadForm } from "@/components/lead-form";

export function GrowthCTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#111214] px-5 py-24 sm:px-8 lg:py-36">
      <div className="editorial-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_18%,rgba(214,183,122,0.1),transparent_28rem)]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.88fr_1fr]">
        <div data-reveal>
          <p className="mb-7 font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">— 05 / Growth Diagnosis</p>
          <h2 className="font-kr text-[2.2rem] font-light leading-[1.16] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3.4rem]">
            지금의 마케팅 구조를<br />진단해보세요.
          </h2>
          <p className="mt-8 max-w-xl font-kr text-lg leading-8 text-[#D8D3CA]">
            운영 중인 채널과 현재 고민을 남겨주시면 민들레효과가 성장 가능성이 높은 지점을 정리해드립니다.
          </p>
          <div className="mt-12 grid max-w-xl gap-3 border-l border-[#D6B77A]/50 pl-6 font-kr text-sm leading-7 text-[#8B8B86]">
            <p>Meta, Facebook, Instagram과 공식 제휴 관계를 의미하지 않습니다.</p>
            <p>광고 성과는 업종, 예산, 기간, 운영 상태에 따라 달라질 수 있습니다.</p>
          </div>
        </div>

        <div data-reveal className="border border-[#343437] bg-[#18191B]/92 p-5 sm:p-8">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 11: SiteFooter

**Files:**
- Create: `src/components/sections/site-footer.tsx`

- [ ] **Step 1: Footer 작성**

```tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#343437] bg-[#111214] px-5 py-10 text-sm text-[#8B8B86] sm:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg uppercase tracking-[0.32em] text-[#D6B77A]">Dandelion Effect</p>
          <p className="mt-2 font-kr text-xs tracking-[0.1em]">주식회사 민들레효과 · Premium Growth Agency</p>
        </div>
        <div className="flex flex-wrap gap-5 font-display text-xs uppercase tracking-[0.16em]">
          <Link href="/blog" className="hover:text-[#D6B77A]">Journal</Link>
          <a href="/rss.xml" className="hover:text-[#D6B77A]">RSS</a>
          <a href="#cta" className="hover:text-[#D6B77A]">Contact</a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Checkpoint** — `npx tsc --noEmit` 통과.

---

## Task 12: 조립 + GSAP 모션 + 최종 검증

**Files:**
- Create: `src/lib/motion.ts`
- Modify: `src/components/landing-page.tsx` (전면 재작성)

- [ ] **Step 1: 공용 reveal 헬퍼 작성**

`src/lib/motion.ts`:

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** 섹션 reveal/framework/marquee 모션을 등록. cleanup은 gsap.context().revert()로 처리한다. */
export function registerScrollReveal() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 84%" },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>("[data-framework-item]").forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 54 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        delay: i * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%" },
      },
    );
  });

  gsap.to("[data-marquee-track]", { xPercent: -50, duration: 32, ease: "none", repeat: -1 });
}

/** Hero 인트로 타임라인 */
export function playHeroIntro() {
  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .from("[data-hero-mark]", { opacity: 0, y: 16, duration: 0.6 })
    .from("[data-hero-line]", { opacity: 0, y: 30, duration: 0.75, stagger: 0.08 }, "-=0.1")
    .from("[data-hero-rail]", { opacity: 0, x: 24, duration: 0.7 }, "-=0.4")
    .from("[data-hero-cta]", { opacity: 0, y: 18, duration: 0.6 }, "-=0.3");
}
```

- [ ] **Step 2: landing-page.tsx 전면 재작성 (섹션 조립 + 모션 컨텍스트)**

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { About } from "@/components/sections/about";
import { Framework } from "@/components/sections/framework";
import { Portfolio } from "@/components/sections/portfolio";
import { Journal } from "@/components/sections/journal";
import { GrowthCTA } from "@/components/sections/growth-cta";
import { SiteFooter } from "@/components/sections/site-footer";
import { playHeroIntro, registerScrollReveal } from "@/lib/motion";

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      playHeroIntro();
      registerScrollReveal();
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen overflow-hidden bg-[#18191B] text-[#F4EFE5]">
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Framework />
        <Portfolio />
        <Journal />
        <GrowthCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 3: 타입/린트/빌드 검증**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: 모두 성공. 미사용 import/변수 경고 없음.

- [ ] **Step 4: 시각 검증 — 데스크탑 + 모바일**

Run: `npm run dev` (백그라운드), 그리고 Claude Preview로 `http://localhost:3000` 시작.
- 데스크탑 1440px 스크린샷: Hero 키워드 회전(골드 강조), 우측 인덱스 레일, Marquee 흐름, About/Framework/Portfolio/Journal/CTA 레이아웃 확인.
- 모바일 390px 스크린샷: Hero 키워드 2×2 그리드, CTA 노출, 햄버거 메뉴 → 오버레이, 섹션 패딩/줄바꿈 확인.
- 점검: 폰트가 국문=Pretendard 고딕, 영문/라벨=Cormorant 세리프로 렌더되는지. 컬러 토큰 일치. 가로 스크롤 없음.

- [ ] **Step 5: Checkpoint** — 발견된 시각 이슈를 해당 섹션 파일에서 수정 후 Step 3~4 재실행. 이상 없으면 완료.

---

## Self-Review (작성자 체크)

**Spec 커버리지:**
- 아트 디렉션(Cinematic Editorial) → Task 1(토큰)+2(배경)+4(Hero) ✅
- 타이포 C안(영문 세리프+국문 고딕) → Task 1 ✅
- 컬러 시스템 → 기존 토큰 유지, Task 1에서 폰트만 변경 ✅
- Hero 영상 슬롯(현재 임시 다크) → Task 2 ✅
- 키워드 회전(검색/퍼지/전환/쌓이) → Task 4 ✅
- Header / Marquee / About / Framework / Portfolio / Journal / CTA / Footer → Task 3,5,6,7,8,9,10,11 ✅
- 컴포넌트 분할(거대 landing-page → sections/*) → Task 12 ✅
- GSAP 모션 + prefers-reduced-motion → Task 12 + smooth-scroll(기존) ✅
- 리드 폼/Supabase/MDX 재사용 → Task 10, 무수정 ✅
- 반응형/접근성 → Task 4(모바일 그리드), Task 3(오버레이), Step 4 시각 검증 ✅

**플레이스홀더:** 없음. 각 컴포넌트 전체 코드 포함.

**타입 일관성:** `HeroBackground`, `LeadForm`, `navItems/frameworkItems/portfolioCases/columnPreviews/marqueeWords`(site.ts 실제 export), `registerScrollReveal`/`playHeroIntro`(motion.ts) 명칭 일관 확인.

**범위:** 단일 구현 계획으로 적정. 영상 제작·신규 블로그 글은 범위 밖(스펙 §10).
