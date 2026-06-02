export function About() {
  return (
    <section id="about" className="relative bg-[#18191B] px-5 py-24 sm:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div data-reveal>
          <p className="mb-7 font-display text-xs uppercase tracking-[0.4em] text-[#D6B77A]">
            — 01 / About Us
          </p>
          <h2 className="font-kr text-[2rem] font-light leading-[1.28] tracking-[-0.03em] text-[#F4EFE5] sm:text-[3rem] lg:text-[3.6rem]">
            우리는 광고를 운영하는<br />회사가 아닙니다.
            <span className="mt-5 block font-medium text-[#E7D2A0]">
              브랜드가 성장하고 확산되는<br />구조를 설계합니다.
            </span>
          </h2>
        </div>

        <div data-reveal className="grid gap-8 border-l border-[#D6B77A]/45 pl-7">
          <p className="font-display text-xl italic leading-8 text-[#DDD6CA]">
            Great brands grow through systems, not luck.
          </p>
          <p className="font-kr text-base leading-8 text-[#A7A39B]">
            민들레효과는 검색, 콘텐츠, 전환, 고객 관계를 하나의 구조로 연결합니다. 광고 집행의 양보다 중요한 것은 브랜드가 스스로 검색되고, 기억되고, 상담으로 이어지는 흐름입니다.
          </p>
          <div className="grid grid-cols-2 gap-px bg-[#343437]">
            {["Search", "Content", "Conversion", "Relationship"].map((p) => (
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
