import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#343437] bg-[#111214] px-5 py-10 text-sm text-[#8B8B86] sm:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg uppercase tracking-[0.32em] text-[#D6B77A]">Dandelion Effect</p>
          <p className="mt-2 font-kr text-xs tracking-[0.1em]">주식회사 민들레효과 · Premium Growth Agency</p>
        </div>
        <div className="flex flex-wrap gap-5 font-display text-xs uppercase tracking-[0.16em]">
          <Link href="/blog" className="hover:text-[#D6B77A]">Journal</Link>
          <a href="/rss.xml" className="hover:text-[#D6B77A]">RSS</a>
          <a href="#cta" className="hover:text-[#D6B77A]">Contact</a>
        </div>
      </div>
    </footer>
  );
}
