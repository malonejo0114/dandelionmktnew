"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/paper/reveal";
import type { Case } from "@/lib/portfolio";
import type { SiteContent } from "@/data/content";

/**
 * 04 Portfolio — D 영상 카드: 사례 영상이 카드로 깔리고, 누르면 자세히(문제→전략→결과→기간)가 열린다.
 * 데이터는 관리자 포트폴리오 그대로. 카드 영상은 화면에 보일 때만 재생한다.
 */
export function PortfolioCards({ cases, intro }: { cases: Case[]; intro: SiteContent["portfolio"] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const shown = cases.slice(0, 6);
  const total = shown.length;

  // 카드 영상: 보일 때만 재생, 동작 줄이기면 포스터만
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videos = Array.from(grid.querySelectorAll("video"));
    videos.forEach((v) => {
      v.muted = true;
      v.setAttribute("muted", "");
    });
    if (reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.25 },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [total]);

  // 자세히 창 열고 닫기
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (openIdx === null) {
      if (dlg.open) dlg.close();
      return;
    }
    if (!dlg.open) dlg.showModal();
    const v = dialogVideoRef.current;
    if (v && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.muted = true;
      void v.play().catch(() => {});
    }
  }, [openIdx]);

  if (total === 0) return null;
  const c = openIdx === null ? null : shown[openIdx];
  const step = (d: number) => setOpenIdx((i) => (i === null ? 0 : (i + d + total) % total));

  return (
    <Reveal className="sec s4" id="portfolio">
      <div className="wrap">
        <div className="s-head">
          <div className="eyebrow x rise" style={{ ["--d" as string]: 0 }}>
            <span className="seed" />
            Portfolio
          </div>
          <h2 className="x rise" style={{ ["--d" as string]: 1 }}>
            {intro.headline}
          </h2>
          <p className="lead x rise" style={{ ["--d" as string]: 2 }}>
            {intro.description}
          </p>
        </div>

        <div className="grid" ref={gridRef}>
          {shown.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              className="clip x reveal"
              style={{ ["--d" as string]: 2 + i * 2 }}
              onClick={() => setOpenIdx(i)}
              aria-label={`${item.title} 자세히 보기`}
            >
              <video src={item.video} poster={item.poster} muted loop playsInline preload="metadata" aria-hidden="true" />
              <span className="more">자세히 보기 +</span>
              <span className="cap">
                <span className="ind">
                  {String(i + 1).padStart(2, "0")} · {item.industry}
                </span>
                <span className="t">{item.title}</span>
                <span className="res">→ {item.result}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="case"
        aria-labelledby="case-title"
        onClose={() => {
          dialogVideoRef.current?.pause();
          setOpenIdx(null);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpenIdx(null);
        }}
      >
        {c ? (
          <div className="in">
            <div className="media">
              <button type="button" className="close" onClick={() => setOpenIdx(null)} aria-label="닫기">
                ×
              </button>
              <video ref={dialogVideoRef} key={c.slug} src={c.video} poster={c.poster} muted loop playsInline autoPlay aria-hidden="true" />
            </div>
            <div className="body" key={`b-${c.slug}`}>
              <div className="ind">
                {String((openIdx ?? 0) + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {c.industry}
              </div>
              <h3 id="case-title">{c.title}</h3>
              <dl>
                <div>
                  <dt>Problem</dt>
                  <dd>{c.problem}</dd>
                </div>
                <div>
                  <dt>Strategy</dt>
                  <dd>{c.strategy}</dd>
                </div>
                <div>
                  <dt>Result</dt>
                  <dd className="res">{c.result}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{c.duration}</dd>
                </div>
              </dl>
              <div className="bar">
                {total > 1 ? (
                  <button type="button" className="btn" onClick={() => step(-1)}>
                    ← 이전 사례
                  </button>
                ) : null}
                <Link className="btn solid" href={`/portfolio/${c.slug}`}>
                  사례 전체 보기 →
                </Link>
                {total > 1 ? (
                  <button type="button" className="btn" onClick={() => step(1)}>
                    다음 사례 →
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </Reveal>
  );
}
