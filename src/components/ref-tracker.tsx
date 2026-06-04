"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RefTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    const key = `ref-tracked:${ref}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/track?ref=${encodeURIComponent(ref)}&path=${encodeURIComponent(pathname)}`, { keepalive: true }).catch(() => {});
  }, [pathname]);
  return null;
}
