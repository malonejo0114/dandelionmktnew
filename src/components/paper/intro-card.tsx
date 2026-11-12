"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/paper/reveal";
import type { SiteContent } from "@/data/content";

/** 01 소개 — B 명함 한 장: 테이블에 명함이 내려앉는다. 가운데 키워드는 관리자 키워드를 돌아가며 보여 준다. */
export function IntroCard({ hero, common }: { hero: SiteContent["hero"]; common: SiteContent["common"] }) {
  const keywords = hero.keywords;
  const [active, setActive] = useState(0);
  const [left, right] = splitTag(hero.agencyTag);

  useEffect(() => {
    if (keywords.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % keywords.length), 2600);
    return () => window.clearInterval(t);
  }, [keywords.length]);

  return (
    <Reveal className="sec" id="intro" aria-label="민들레효과 소개">
      <div className="wrap s1">
        <div className="card x flip" style={{ ["--d" as string]: 0 }}>
          <div className="row">
            <span>{left}</span>
            <span>{right}</span>
          </div>
          <h1>
            {hero.headPrefix}{" "}
            <span className="kw">
              <span key={active}>{keywords[active]?.kr}</span>
            </span>
            <br />
            {hero.keywordSuffix} {hero.headSuffix}
          </h1>
          <div className="row">
            <span>{common.brandName}</span>
            <span>dandelionmkt.co.kr</span>
          </div>
        </div>
        <p className="lead x rise" style={{ ["--d" as string]: 8 }}>
          {hero.support}
        </p>
        <div className="cta x rise" style={{ ["--d" as string]: 9 }}>
          <a className="btn solid" href={hero.ctaPrimaryHref}>
            {hero.ctaPrimaryLabel}
          </a>
          <a className="btn" href={hero.ctaSecondaryHref}>
            {hero.ctaSecondaryLabel}
          </a>
        </div>
      </div>
    </Reveal>
  );
}

function splitTag(tag: string): [string, string] {
  const parts = tag.split("·").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(" · ")];
  return [tag, ""];
}
