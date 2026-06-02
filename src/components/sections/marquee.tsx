import { marqueeWords } from "@/data/site";

export function Marquee() {
  const words = [...marqueeWords, ...marqueeWords];
  return (
    <div className="overflow-hidden border-y border-[#343437] bg-[#111214] py-4">
      <div data-marquee-track className="flex w-max items-center gap-10 whitespace-nowrap">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="flex items-center gap-10">
            <span className="font-display text-2xl uppercase tracking-[0.18em] text-[#D6B77A]/80 sm:text-4xl">
              {word}
            </span>
            <span className="text-[#343437]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
