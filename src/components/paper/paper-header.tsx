"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DandelionMark } from "@/components/dandelion-mark";
import type { SiteContent } from "@/data/content";

/** 종이 리뉴얼 메뉴. 첫 화면 영상과 겹치지 않도록 항상 바탕색 띠로 둔다 (72px, 스크롤하면 56px). */
export function PaperHeader({ common }: { common: SiteContent["common"] }) {
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
    if (!open) return;
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
  }, [open]);

  return (
    <header className={`p-header ${scrolled ? "scrolled" : ""}`}>
      <div className="bar">
        <Link href="/" className="brand" aria-label={`${common.brandName} 홈`}>
          <DandelionMark className="size-7" />
          <span>{common.brandName}</span>
        </Link>
        <span className="corp">{common.corpName}</span>
        <nav aria-label="주요 메뉴">
          {common.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href="#cta" className="contact">
            {common.contactLabel}
          </a>
        </nav>
        <button ref={triggerRef} type="button" className="burger" onClick={() => setOpen(true)} aria-label="메뉴 열기">
          <span />
          <span />
        </button>
      </div>

      {open ? (
        <div role="dialog" aria-modal="true" aria-label="메뉴" className="p-menu">
          <div className="top">
            <span>{common.brandName}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="메뉴 닫기">
              ×
            </button>
          </div>
          <nav>
            {common.nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="#cta" className="contact" onClick={() => setOpen(false)}>
              {common.mobileCtaLabel}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
