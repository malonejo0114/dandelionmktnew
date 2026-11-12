import Link from "next/link";
import type { SiteContent } from "@/data/content";

export function PaperFooter({ common }: { common: SiteContent["common"] }) {
  return (
    <footer className="p-footer">
      <div>
        <p className="name">{common.brandName}</p>
        <p className="tag">{common.footerTagline}</p>
      </div>
      <p className="motto" aria-hidden="true">
        Small seeds, wide fields.
      </p>
      <nav aria-label="바닥 메뉴">
        <Link href="/blog">Journal</Link>
        <a href="/rss.xml">RSS</a>
        <a href="#cta">Contact</a>
      </nav>
    </footer>
  );
}
