import { LeadForm } from "@/components/lead-form";
import type { SiteContent } from "@/data/content";

export function GrowthCTA({ cta }: { cta: SiteContent["cta"] }) {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#111214] px-5 py-24 sm:px-8 lg:py-36">
      <div className="editorial-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_18%,rgba(214,183,122,0.1),transparent_28rem)]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.88fr_1fr]">
        <div data-reveal>
          <p className="mb-7 font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">{cta.label}</p>
          <h2 className="whitespace-pre-line font-kr text-[2.2rem] font-light leading-[1.16] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3.4rem]">
            {cta.headline}
          </h2>
          <p className="mt-8 max-w-xl font-kr text-lg leading-8 text-[#D8D3CA]">
            {cta.description}
          </p>
          <div className="mt-12 grid max-w-xl gap-3 border-l border-[#D6B77A]/50 pl-6 font-kr text-sm leading-7 text-[#A7A39B]">
            {cta.compliance.map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>

        <div data-reveal className="border border-[#343437] bg-[#18191B]/92 p-5 sm:p-8">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
