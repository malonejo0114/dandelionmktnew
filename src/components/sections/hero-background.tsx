"use client";

import { useEffect, useRef } from "react";

/**
 * Hero 배경.
 * 영상 루프(public/hero.mp4) + 좌/하단 다크 오버레이로 헤드라인 가독성을 확보한다.
 * prefers-reduced-motion 사용자는 영상을 멈추고 포스터 프레임만 노출한다.
 * 영상 교체 시 public/hero.mp4 / public/hero-poster.jpg 만 바꾸면 된다.
 */
export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    // 일부 브라우저에서 autoplay가 막히면 명시적으로 재생 시도
    void video.play().catch(() => {});
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* 에디토리얼 그리드 텍스처 (아주 옅게) */}
      <div className="editorial-grid absolute inset-0 opacity-20" />

      {/* 다크 오버레이 — 좌측(헤드라인 영역)과 하단을 더 어둡게 */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,18,20,0.78),rgba(17,18,20,0.32)_58%,rgba(17,18,20,0.18))]" />
      <div className="hero-overlay absolute inset-0 bg-[linear-gradient(180deg,rgba(17,18,20,0.28),rgba(17,18,20,0.72))]" />
    </div>
  );
}
