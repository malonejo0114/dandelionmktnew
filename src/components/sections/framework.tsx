import type { SiteContent } from "@/data/content";

export function Framework({ framework }: { framework: SiteContent["framework"] }) {
  return (
    <section id="framework" className="bg-[#111214] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-16 grid gap-6 border-b border-[#343437] pb-10 lg:grid-cols-[0.42fr_1fr]">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">{framework.label}</p>
          <h2 className="font-display text-5xl uppercase leading-[0.95] tracking-[0.02em] text-[#F4EFE5] sm:text-7xl lg:text-8xl">
            {framework.title}
          </h2>
        </div>

        <div className="grid gap-px bg-[#343437]">
          {framework.items.map((item, i) => (
            <article
              key={item.code}
              data-framework-item
              className="group grid gap-6 bg-[#111214] p-6 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#F4EFE5] hover:text-[#111214] md:grid-cols-[0.16fr_0.32fr_1fr] md:p-9"
            >
              <p className="font-display text-6xl leading-none text-[#D6B77A] group-hover:text-[#8F6E32]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <p className="font-display text-2xl uppercase tracking-[0.14em] text-[#F4EFE5] group-hover:text-[#111214]">
                  {item.code}
                </p>
                <h3 className="mt-3 font-kr text-xl font-medium text-[#D6B77A] group-hover:text-[#8F6E32]">
                  {item.title}
                </h3>
              </div>
              <p className="max-w-3xl font-kr leading-8 text-[#A7A39B] group-hover:text-[#4E4A43]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
