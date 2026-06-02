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

export function LandingPage({ cases }: { cases: Case[] }) {
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
        <Portfolio cases={cases} />
        <Journal />
        <GrowthCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
