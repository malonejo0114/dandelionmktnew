"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DandelionMark } from "@/components/dandelion-mark";
import { navItems } from "@/data/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const trigger = triggerRef.current;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKeyDown);
        trigger?.focus();
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`flex items-center justify-between border-b border-[#343437] px-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-8 ${
          scrolled ? "h-14 bg-[#111214]/90 backdrop-blur-md" : "h-[72px] bg-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-3" aria-label="Dandelion Effect home">
          <DandelionMark className="size-7" />
          <span className="font-display text-base uppercase tracking-[0.28em] text-[#F4EFE5]">
            Dandelion Effect
          </span>
        </Link>

        <span className="hidden font-kr text-xs tracking-[0.1em] text-[#8B8B86] lg:block">
          주식회사 민들레효과
        </span>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display text-xs uppercase tracking-[0.22em] text-[#F4EFE5]/80 transition-colors hover:text-[#D6B77A]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#cta"
            className="border border-[#D6B77A] px-5 py-2 font-display text-xs uppercase tracking-[0.2em] text-[#D6B77A] transition-colors hover:bg-[#D6B77A] hover:text-[#111214]"
          >
            Contact
          </a>
        </nav>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col gap-[5px] lg:hidden"
          aria-label="메뉴 열기"
        >
          <span className="h-px w-6 bg-[#F4EFE5]" />
          <span className="h-px w-6 bg-[#F4EFE5]" />
        </button>
      </div>

      {open ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex flex-col bg-[#111214] px-6 py-6 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-base uppercase tracking-[0.28em] text-[#F4EFE5]">
              Dandelion Effect
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="메뉴 닫기" className="text-2xl text-[#F4EFE5]">
              ×
            </button>
          </div>
          <nav className="mt-16 flex flex-col gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-kr text-3xl text-[#F4EFE5]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="mt-4 border border-[#D6B77A] px-6 py-4 text-center font-display text-sm uppercase tracking-[0.2em] text-[#D6B77A]"
            >
              무료 성장 진단
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
