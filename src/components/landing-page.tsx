"use client";

import { useEffect, useRef } from "react";
import "@/app/paper.css";
import { HeroVideo } from "@/components/sections/hero-video";
import { PaperHeader } from "@/components/paper/paper-header";
import { IntroCard } from "@/components/paper/intro-card";
import { PhilosophyFlow } from "@/components/paper/philosophy-flow";
import { FrameworkGather } from "@/components/paper/framework-gather";
import { PortfolioCards } from "@/components/paper/portfolio-cards";
import { JournalStamps } from "@/components/paper/journal-stamps";
import { LetterContact } from "@/components/paper/letter-contact";
import { PaperFooter } from "@/components/paper/paper-footer";
import type { Case } from "@/lib/portfolio";
import type { SiteContent } from "@/data/content";
import type { Post } from "@/lib/posts";

/**
 * 메인 페이지 — 종이 리뉴얼 (2026-11-12).
 * 순서: 첫 화면 영상 → 01 소개(명함) → 02 철학(흐름선) → 03 Framework(흩어졌다 모이는 글자)
 *       → 04 Portfolio(영상 카드) → 05 Journal(소인 카드) → 06 문의(편지지)
 * 스타일은 src/app/paper.css (.paper 아래에서만 적용).
 */
export function LandingPage({ cases, content, posts }: { cases: Case[]; content: SiteContent; posts: Post[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // JS가 뜬 뒤에만 등장 애니메이션용으로 요소를 숨긴다 (JS 없으면 그냥 보임)
  useEffect(() => {
    rootRef.current?.classList.add("js");
  }, []);

  return (
    <div ref={rootRef} className="paper">
      <PaperHeader common={content.common} />
      <main>
        <section aria-label="민들레효과 소개 영상" className="hero-video-wrap">
          <HeroVideo />
        </section>
        <IntroCard hero={content.hero} common={content.common} />
        <PhilosophyFlow about={content.about} finalStep={content.framework.title} />
        <FrameworkGather framework={content.framework} />
        <PortfolioCards cases={cases} intro={content.portfolio} />
        <JournalStamps posts={posts} />
        <LetterContact cta={content.cta} common={content.common} />
      </main>
      <PaperFooter common={content.common} />
    </div>
  );
}
