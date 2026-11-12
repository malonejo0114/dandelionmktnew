"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * 화면에 들어오면 한 번 .play 를 붙인다. 안쪽의 .x 요소들이 paper.css 의 등장 애니메이션을 재생한다.
 * JS가 없거나 늦게 뜨면 그냥 보인다 (.paper.js 가 붙기 전에는 숨기지 않음).
 */
export function Reveal({
  as: Tag = "section",
  className = "",
  threshold = 0.2,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  threshold?: number;
  children: ReactNode;
  id?: string;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref} className={`v ${play ? "play" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
