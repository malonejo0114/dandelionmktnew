"use client";

import { usePathname } from "next/navigation";

export function FloatingKakao({ url }: { url: string }) {
  const pathname = usePathname();
  if (!url || pathname.startsWith("/admin")) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오 채널 상담"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 text-[#3C1E1E] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B77A] sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
        <path d="M12 3C6.48 3 2 6.46 2 10.73c0 2.76 1.88 5.18 4.72 6.55-.2.72-.72 2.62-.82 3.03-.13.5.18.5.39.36.16-.11 2.5-1.7 3.51-2.39.39.05.78.08 1.2.08 5.52 0 10-3.46 10-7.73C22 6.46 17.52 3 12 3z" />
      </svg>
      <span className="hidden font-kr text-sm font-bold sm:inline">카카오 상담</span>
    </a>
  );
}
