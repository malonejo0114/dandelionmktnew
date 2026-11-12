import { Reveal } from "@/components/paper/reveal";
import type { SiteContent } from "@/data/content";

/** 02 철학 — A 흐름선: 선이 그어지며 다섯 단계가 피어난다. 단계가 갈수록 홀씨줄이 늘어난다. */
const KO: Record<string, string> = {
  search: "검색",
  content: "콘텐츠",
  conversion: "전환",
  relationship: "고객 관계",
  "growth system": "성장 구조",
};

// 단계별 홀씨줄 (가운데에서 뻗는 선). 마지막은 금색 씨앗.
const RAYS = [
  "",
  "M20 20V7M20 20l11 6M20 20 9 26",
  "M20 20V5M20 20l14-5M20 20l9 12M20 20l-9 12M20 20 6 15",
  "M20 20V3M20 20l12-12M20 20h17M20 20l12 12M20 20v17M20 20 8 32M20 20H3M20 20 8 8",
  "M20 20V2M20 20l9-15.6M20 20l15.6-9M20 20h18M20 20l15.6 9M20 20l9 15.6M20 20v18M20 20l-9 15.6M20 20 4.4 29M20 20H2M20 20 4.4 11M20 20 11 4.4",
];

export function PhilosophyFlow({ about, finalStep }: { about: SiteContent["about"]; finalStep: string }) {
  const steps = [...about.proofs.slice(0, 4), finalStep];
  return (
    <Reveal className="sec" id="about">
      <div className="wrap s2">
        <div className="eyebrow x rise" style={{ ["--d" as string]: 0 }}>
          <span className="seed" />
          Philosophy
        </div>
        <h2 className="x rise" style={{ ["--d" as string]: 0 }}>
          {about.headline}
          {"\n"}
          <em>{about.headlineAccent}</em>
        </h2>
        <p className="script x wipe" style={{ ["--d" as string]: 2 }}>
          {about.lead}
        </p>
        <p className="lead x rise" style={{ ["--d" as string]: 3 }}>
          {about.body}
        </p>
        <ol className="flow">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            const rays = RAYS[Math.min(i, RAYS.length - 1)];
            return (
              <li key={`${step}-${i}`}>
                <div className="node x pop" style={{ ["--d" as string]: 4 + i * 2 }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                    {rays ? (
                      <g stroke="#1c1a18" strokeWidth={0.9 - i * 0.05}>
                        <path d={rays} />
                      </g>
                    ) : null}
                    <circle cx="20" cy="20" r={last ? 3.4 : 3} fill={last ? "#a87a26" : "#1c1a18"} />
                  </svg>
                </div>
                <div>
                  <b>{step}</b> <span>{KO[step.toLowerCase()] ?? ""}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}
