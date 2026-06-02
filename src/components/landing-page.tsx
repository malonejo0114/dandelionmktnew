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
import type { Case } from "@/lib/portfolio";
import type { SiteContent } from "@/data/content";

export function LandingPage({ cases, content }: { cases: Case[]; content: SiteContent }) {
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
      <SiteHeader common={content.common} />
      <main>
        <Hero hero={content.hero} />
        <Marquee words={content.common.marqueeWords} />
        <About about={content.about} />
        <Framework framework={content.framework} />
        <Portfolio cases={cases} intro={content.portfolio} />
        <Journal />
        <GrowthCTA cta={content.cta} />
      </main>
      <SiteFooter common={content.common} />
    </div>
  );
}
