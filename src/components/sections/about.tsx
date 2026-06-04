import type { SiteContent } from "@/data/content";

export function About({ about }: { about: SiteContent["about"] }) {
  return (
    <section id="about" className="relative bg-[#18191B] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[1100px]">
        <div data-reveal className="text-center">
          <h2 className="mx-auto max-w-3xl whitespace-pre-line font-kr text-[2.2rem] font-light leading-[1.2] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3.4rem]">
            {about.headline}
            <span className="mt-4 block whitespace-pre-line font-medium text-[#E7D2A0]">
              {about.headlineAccent}
            </span>
          </h2>
        </div>

        <div data-reveal className="mx-auto mt-14 grid max-w-3xl gap-8 text-center">
          <p className="font-display text-xl italic leading-8 text-[#DDD6CA]">{about.lead}</p>
          <p className="font-kr text-base leading-8 text-[#A7A39B]">{about.body}</p>
        </div>

        <div data-reveal className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-px bg-[#343437] sm:grid-cols-4">
          {about.proofs.map((p) => (
            <div key={p} className="flex items-center justify-center bg-[#111214] px-2 py-4 text-center sm:p-5">
              <p className="font-display text-xs uppercase tracking-[0.08em] text-[#F4EFE5] sm:text-lg sm:tracking-[0.16em]">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
