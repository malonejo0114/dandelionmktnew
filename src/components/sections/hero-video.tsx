"use client";

import { useEffect, useRef } from "react";

/**
 * 첫 화면 영상 (민들레효과 모션 프로젝트 산출물).
 * 원본·규칙: D:\Ai\민들레효과 모션\handoff-homepage\HANDOFF.md
 * - 영상 위에 글자·버튼·어두운 막을 겹치지 않는다. 소개 문구는 아래 섹션(Hero)이 맡는다.
 * - 영상은 자르거나 다시 압축하지 않는다 (24초 반복 이음새가 맞춰져 있음).
 * - 폭 767px 이하 = 세로 영상, 1400px 미만 또는 데이터 절약 = 720p, 그 외 1080p.
 * - "동작 줄이기" 설정이면 영상 없이 첫 장면 이미지만 보인다.
 * - 파일을 바꿀 땐 파일명을 바꾼다 (/media/* 는 1년 캐시, next.config.ts).
 */
const MEDIA = {
  desktop: "/media/hero-desktop.mp4",
  desktopSmall: "/media/hero-desktop-720.mp4",
  mobile: "/media/hero-mobile.mp4",
  posterDesktop: "/media/hero-poster-desktop.jpg",
  posterMobile: "/media/hero-poster-mobile.jpg",
};

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // iOS 자동재생 조건: muted 가 속성·프로퍼티 모두에 있어야 한다 (React 의 muted 는 SSR 에서 빠질 수 있음).
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");

    const mobile = window.matchMedia("(max-width: 767px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = "";

    const pick = () => {
      const isMobile = mobile.matches;
      const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
      const src = isMobile
        ? MEDIA.mobile
        : saveData || window.innerWidth < 1400
          ? MEDIA.desktopSmall
          : MEDIA.desktop;
      v.poster = isMobile ? MEDIA.posterMobile : MEDIA.posterDesktop;

      if (reduce.matches) {
        v.removeAttribute("src");
        v.load();
        current = "";
        return;
      }
      if (src === current) return;
      current = src;
      v.src = src;
      void v.play().catch(() => {}); // 자동재생이 막혀도 첫 장면 이미지가 보인다
    };

    pick();
    mobile.addEventListener("change", pick);
    reduce.addEventListener("change", pick);
    return () => {
      mobile.removeEventListener("change", pick);
      reduce.removeEventListener("change", pick);
    };
  }, []);

  return (
    <div className="hero-video" aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-video__media"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
      />
    </div>
  );
}
