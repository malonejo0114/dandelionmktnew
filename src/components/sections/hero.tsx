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

      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
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
      </div>

      <div className="absolute inset-x-5 bottom-8 z-10 h-px bg-[linear-gradient(90deg,#d6b77a,transparent)] sm:inset-x-8" />
    </section>
  );
}
