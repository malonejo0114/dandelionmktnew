"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = {
  key: string;
  href: string;
  label: string;
  bg: string;
  fg: string;
  icon: React.ReactNode;
};

const KakaoIcon = (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M12 3C6.48 3 2 6.46 2 10.73c0 2.76 1.88 5.18 4.72 6.55-.2.72-.72 2.62-.82 3.03-.13.5.18.5.39.36.16-.11 2.5-1.7 3.51-2.39.39.05.78.08 1.2.08 5.52 0 10-3.46 10-7.73C22 6.46 17.52 3 12 3z" />
  </svg>
);

const YoutubeIcon = (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.85 12 3.85 12 3.85s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51A3.02 3.02 0 0 0 23.5 17.5c.5-1.9.5-5.5.5-5.5s0-3.6-.5-5.5zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
  </svg>
);

export function FloatingSocial({ kakaoUrl, youtubeUrl }: { kakaoUrl: string; youtubeUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: Item[] = [];
  if (kakaoUrl)
    items.push({ key: "kakao", href: kakaoUrl, label: "카카오 상담", bg: "bg-[#FEE500]", fg: "text-[#3C1E1E]", icon: KakaoIcon });
  if (youtubeUrl)
    items.push({ key: "youtube", href: youtubeUrl, label: "유튜브", bg: "bg-[#FF0000]", fg: "text-white", icon: YoutubeIcon });

  if (pathname.startsWith("/admin") || items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {items.map((item, i) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          tabIndex={open ? 0 : -1}
          style={{ transitionDelay: open ? `${i * 50}ms` : "0ms" }}
          className={`flex items-center gap-2.5 rounded-full ${item.bg} ${item.fg} px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-105 ${
            open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          {item.icon}
          <span className="font-kr text-sm font-bold">{item.label}</span>
        </a>
      ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "채널 닫기" : "상담 채널 열기"}
        className="flex size-14 items-center justify-center rounded-full bg-[#D6B77A] text-[#111214] shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EFE5]"
      >
        <svg
          viewBox="0 0 24 24"
          className={`size-7 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M12 5v14M5 12h14" />
          ) : (
            <>
              <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
