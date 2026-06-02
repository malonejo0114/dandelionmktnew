import type { SiteContent } from "@/data/content";

export function About({ about }: { about: SiteContent["about"] }) {
  return (
    <section id="about" className="relative bg-[#18191B] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div data-reveal>
          <p className="mb-7 font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">
            {about.label}
          </p>
          <h2 className="whitespace-pre-line font-kr text-[2rem] font-light leading-[1.28] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3rem] lg:text-[3.6rem]">
            {about.headline}
            <span className="mt-5 block font-medium text-[#E7D2A0] whitespace-pre-line">
              {about.headlineAccent}
            </span>
          </h2>
        </div>

        <div data-reveal className="grid gap-8 border-l border-[#D6B77A]/45 pl-7">
          <p className="font-display text-xl italic leading-8 text-[#DDD6CA]">
            {about.lead}
          </p>
          <p className="font-kr text-base leading-8 text-[#A7A39B]">
            {about.body}
          </p>
          <div className="grid grid-cols-2 gap-px bg-[#343437]">
            {about.proofs.map((p) => (
              <div key={p} className="bg-[#111214] p-5">
                <p className="font-display text-xl uppercase tracking-[0.16em] text-[#F4EFE5]">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
