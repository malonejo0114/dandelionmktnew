"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SiteContent } from "@/data/content";

/**
 * 03 Framework — 흩어졌다 모이는 글자 (2026-11-12 사장님 요청 맞춤 연출).
 * 글자 하나하나가 홀씨처럼 흩어져 있다가, 스크롤을 내릴수록 제자리로 모여 문장이 된다.
 * 큰 문장 → 네 구조의 영문 이름 순서로 모이고, 설명은 다 모인 뒤 올라온다.
 * 동작 줄이기 설정이면 처음부터 모인 상태로 보인다.
 */
const DEFAULT_HEADLINE = "홀씨 하나가 들판이 되기까지,\n네 개의 구조를 설계합니다.";

export function FrameworkGather({ framework }: { framework: SiteContent["framework"] }) {
  const rootRef = useRef<HTMLElement>(null);
  const headline = framework.headline || DEFAULT_HEADLINE;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mobile = window.matchMedia("(max-width: 720px)").matches;
      const spread = mobile ? 0.55 : 0.75; // 화면 폭 대비 흩어지는 거리

      const scatter = (chars: HTMLElement[]) =>
        gsap.fromTo(
          chars,
          {
            x: () => gsap.utils.random(-1, 1) * window.innerWidth * spread * 0.5,
            y: () => gsap.utils.random(-1, 1) * window.innerHeight * 0.45,
            rotate: () => gsap.utils.random(-140, 140),
            scale: () => gsap.utils.random(0.3, 1.6),
            // 흩어진 글자가 홀씨처럼 희미하게 보이다가 모이면서 또렷해진다
            opacity: () => gsap.utils.random(0.12, 0.45),
            filter: "blur(3px)",
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            ease: "power2.out",
            stagger: { each: 0.02, from: "random" },
          },
        );

      // 1) 큰 문장: 섹션이 화면 아래에서 들어올 때부터 중간쯤 올 때까지 스크롤에 맞춰 모인다
      const bigChars = gsap.utils.toArray<HTMLElement>(".big .ch", root);
      gsap.timeline({
        scrollTrigger: { trigger: root.querySelector(".big"), start: "top 95%", end: "top 35%", scrub: 0.8 },
      }).add(scatter(bigChars));

      // 2) 네 구조: 줄마다 영문 이름 글자가 모이고, 숫자·설명이 따라 올라온다
      gsap.utils.toArray<HTMLElement>(".row", root).forEach((row) => {
        const chars = gsap.utils.toArray<HTMLElement>(".ch", row);
        const rest = row.querySelectorAll(".num, .kr, p");
        gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 92%", end: "top 55%", scrub: 0.6 },
        })
          .add(scatter(chars))
          .fromTo(rest, { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, ease: "power2.out" }, "-=0.25");
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="sec s3" id="framework">
      <div className="wrap">
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          <span className="seed" />
          {framework.title}
        </div>
        <h2 className="big" aria-label={headline.replace(/\n/g, " ")}>
          {headline.split("\n").map((line, li) => (
            <span key={li} style={{ display: "block" }} aria-hidden="true">
              <Gather text={line} />
            </span>
          ))}
        </h2>

        <div className="rows">
          {framework.items.map((item, i) => (
            <article key={item.code} className="row">
              <div className="num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3>
                <small aria-label={item.code}>
                  <Gather text={capitalize(item.code)} />
                </small>
                <span className="kr" style={{ display: "block" }}>
                  {item.title}
                </span>
              </h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 글자 단위로 쪼갠다. 단어 안에서는 줄이 바뀌지 않도록 단어로 한 번 더 묶는다. */
function Gather({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span className="gather" aria-hidden="true">
      {words.map((word, wi) => (
        <span key={wi}>
          <span className="word">
            {Array.from(word).map((ch, i) => (
              <span key={i} className="ch">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

function capitalize(code: string) {
  return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
}
