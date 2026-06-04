"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Case } from "@/lib/portfolio";
import type { SiteContent } from "@/data/content";

const SWIPE_THRESHOLD = 70;

export function Portfolio({ cases, intro }: { cases: Case[]; intro: SiteContent["portfolio"] }) {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const reduceMotion = useReducedMotion();
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const count = cases.length;

  const go = (next: number) => {
    setFlipped(false);
    setActive((next + count) % count); // 순환
  };

  // 활성 카드만 재생, 나머지 정지. reduce-motion이면 전부 정지(포스터).
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && !reduceMotion) void video.play().catch(() => {});
      else video.pause();
    });
  }, [active, reduceMotion]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) go(active + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(active - 1);
  };

  const handleTapCard = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setFlipped((f) => !f);
    }
  };

  const current = cases[active];

  return (
    <section id="portfolio" className="bg-[#18191B] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-14 text-center">
          <h2 className="font-display text-5xl uppercase leading-[0.95] tracking-[0.03em] text-[#F4EFE5] sm:text-7xl lg:text-8xl">
            {intro.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-kr leading-8 text-[#A7A39B]">
            {intro.description}
          </p>
        </div>

        <div data-reveal className="grid items-center gap-14 lg:grid-cols-[auto_1fr] lg:gap-16">
          {/* 카드 덱 */}
          <div className="flex flex-col items-center gap-8">
            <div className="relative h-[460px] w-[300px] sm:h-[520px] sm:w-[360px]" style={{ perspective: 1400 }}>
              {cases.map((item, i) => {
                const diff = i - active;
                const isActive = diff === 0;
                const isPassed = diff < 0;
                const target = isPassed
                  ? { x: -240, y: 0, scale: 0.92, opacity: 0, filter: "grayscale(1) brightness(0.7)" }
                  : {
                      x: diff * 34,
                      y: diff * 14,
                      scale: 1 - diff * 0.05,
                      opacity: diff > 2 ? 0 : 1,
                      filter: isActive ? "grayscale(0) brightness(1)" : "grayscale(1) brightness(0.62)",
                    };

                return (
                  <motion.article
                    key={item.slug}
                    className="absolute inset-0 rounded-2xl border border-[#343437] bg-[#111214] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
                    style={{
                      zIndex: isActive ? 30 : 20 - Math.abs(diff),
                      cursor: isActive ? "grab" : "default",
                      perspective: 1400,
                    }}
                    animate={target}
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
                    drag={isActive ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4}
                    onDragEnd={isActive ? handleDragEnd : undefined}
                    onTap={isActive ? handleTapCard : undefined}
                    whileTap={isActive ? { cursor: "grabbing" } : undefined}
                  >
                    <motion.div
                      className="relative h-full w-full"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: isActive && flipped ? 180 : 0 }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
                    >
                      {/* 앞면 — 영상 */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]">
                        <video
                          ref={(el) => {
                            videoRefs.current[i] = el;
                          }}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          poster={item.poster}
                          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                        >
                          <source src={item.video} type="video/mp4" />
                        </video>
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_36%,rgba(17,18,20,0.55)_62%,rgba(17,18,20,0.96))]" />

                        {/* 모바일 탭 힌트 */}
                        {isActive && !flipped ? (
                          <span className="absolute right-4 top-4 rounded-full border border-[#F4EFE5]/40 bg-[#111214]/40 px-3 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-[#F4EFE5] backdrop-blur-sm lg:hidden">
                            탭하여 상세 보기
                          </span>
                        ) : null}

                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 sm:p-7">
                          <div className="min-w-0">
                            <p className="font-display text-6xl font-medium leading-none text-[#D6B77A] sm:text-7xl">
                              {String(i + 1).padStart(2, "0")}
                            </p>
                            <h3 className="mt-3 truncate font-kr text-2xl font-bold text-[#F4EFE5] sm:text-3xl">
                              {item.title}
                            </h3>
                            <p className="mt-1 font-display text-xs uppercase tracking-[0.24em] text-[#8B8B86]">
                              {item.industry}
                            </p>
                          </div>
                          {isActive ? (
                            <Link
                              href={`/portfolio/${item.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              onPointerDownCapture={(e) => e.stopPropagation()}
                              className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-[#D6B77A] px-3 py-2 font-display text-[10px] uppercase tracking-[0.16em] text-[#D6B77A] transition-colors hover:bg-[#D6B77A] hover:text-[#111214]"
                            >
                              자세히
                              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      {/* 뒷면 — 상세 (모바일 플립) */}
                      <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[#15161a] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <p className="font-display text-xs uppercase tracking-[0.24em] text-[#D6B77A]">
                          {String(i + 1).padStart(2, "0")} · {item.industry}
                        </p>
                        <h3 className="mt-2 font-kr text-xl font-bold text-[#F4EFE5]">{item.title}</h3>
                        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
                          <BackRow label="Problem" value={item.problem} />
                          <BackRow label="Strategy" value={item.strategy} />
                          <BackRow label="Result" value={item.result} gold />
                          <BackRow label="Duration" value={item.duration} />
                        </div>
                        <Link
                          href={`/portfolio/${item.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          className="mt-4 inline-flex items-center justify-center gap-1 self-end rounded-full border border-[#D6B77A] px-4 py-2 font-display text-[10px] uppercase tracking-[0.16em] text-[#D6B77A]"
                        >
                          더 자세히 보기
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  </motion.article>
                );
              })}
            </div>

            {/* 컨트롤 — 순환이므로 비활성 없음 */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label="이전 케이스"
                className="flex size-12 items-center justify-center rounded-full border border-[#343437] text-[#F4EFE5] transition-colors hover:border-[#D6B77A] hover:text-[#D6B77A]"
              >
                <ArrowLeft className="size-5" />
              </button>
              <p className="font-display text-sm tracking-[0.2em] text-[#8B8B86]">
                <span className="text-[#D6B77A]">{String(active + 1).padStart(2, "0")}</span>
                {" / "}
                {String(count).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label="다음 케이스"
                className="flex size-12 items-center justify-center rounded-full border border-[#343437] text-[#F4EFE5] transition-colors hover:border-[#D6B77A] hover:text-[#D6B77A]"
              >
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>

          {/* 활성 케이스 상세 — PC 전용 */}
          <div className="hidden min-h-[340px] w-full lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                className="grid gap-px bg-[#343437]"
              >
                <Row label="Industry" value={current.industry} strong />
                <Row label="Problem" value={current.problem} />
                <Row label="Strategy" value={current.strategy} />
                <Row label="Result" value={current.result} strong />
                <Row label="Duration" value={current.duration} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

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

function BackRow({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <p className="font-display text-[10px] uppercase tracking-[0.22em] text-[#8B8B86]">{label}</p>
      <p className={gold ? "mt-1 font-kr font-medium text-[#D6B77A]" : "mt-1 font-kr leading-6 text-[#CFC8BC]"}>
        {value}
      </p>
    </div>
  );
}
