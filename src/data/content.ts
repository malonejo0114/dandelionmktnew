export type NavItem = { label: string; href: string };
export type HeroKeyword = { kr: string; en: string };
export type FrameworkItem = { code: string; title: string; body: string };

export type SiteContent = {
  hero: {
    agencyTag: string;
    overline: string;
    headPrefix: string;
    keywords: HeroKeyword[];
    keywordSuffix: string;
    headSuffix: string;
    support: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
  };
  about: {
    label: string;
    headline: string;
    headlineAccent: string;
    lead: string;
    body: string;
    proofs: string[];
  };
  framework: {
    label: string;
    title: string;
    items: FrameworkItem[];
  };
  cta: {
    label: string;
    headline: string;
    description: string;
    compliance: string[];
  };
  common: {
    brandName: string;
    corpName: string;
    contactLabel: string;
    mobileCtaLabel: string;
    nav: NavItem[];
    marqueeWords: string[];
    footerTagline: string;
  };
};

export const defaultContent: SiteContent = {
  hero: {
    agencyTag: "Premium Growth Agency · Seoul",
    overline: "Structure that spreads",
    headPrefix: "브랜드가",
    keywords: [
      { kr: "검색되는", en: "Search" },
      { kr: "퍼지는", en: "Spread" },
      { kr: "전환되는", en: "Convert" },
      { kr: "쌓이는", en: "Automate" },
    ],
    keywordSuffix: "구조를",
    headSuffix: "설계합니다.",
    support:
      "단순한 노출이 아니라, 상품과 업장의 본질에 맞는 구조를 설계해 브랜드의 지속 가능한 성장을 만듭니다.",
    ctaPrimaryLabel: "무료 성장 진단 받기",
    ctaPrimaryHref: "#cta",
    ctaSecondaryLabel: "포트폴리오 보기",
    ctaSecondaryHref: "#portfolio",
  },
  about: {
    label: "— 01 / About Us",
    headline: "우리는 광고를 운영하는\n회사가 아닙니다.",
    headlineAccent: "브랜드가 성장하고 확산되는\n구조를 설계합니다.",
    lead: "Great brands grow through systems, not luck.",
    body: "민들레효과는 검색, 콘텐츠, 전환, 고객 관계를 하나의 구조로 연결합니다. 광고 집행의 양보다 중요한 것은 브랜드가 스스로 검색되고, 기억되고, 상담으로 이어지는 흐름입니다.",
    proofs: ["Search", "Content", "Conversion", "Relationship"],
  },
  framework: {
    label: "— 02 / Framework",
    title: "Growth System",
    items: [
      { code: "SEARCH", title: "검색되는 구조", body: "고객이 문제를 검색하는 순간 브랜드가 발견되도록 SEO, 콘텐츠, 랜딩의 언어를 정렬합니다." },
      { code: "SPREAD", title: "퍼지는 구조", body: "광고 소재와 메시지 실험을 통해 기억에 남는 후킹 포인트를 반복적으로 찾아냅니다." },
      { code: "CONVERT", title: "전환되는 구조", body: "문의DB, 상담 흐름, CTA, 폼 마찰을 함께 보며 광고 이후의 병목을 줄입니다." },
      { code: "AUTOMATE", title: "쌓이는 구조", body: "리포트, CRM, 자동화 루틴을 연결해 다음 실험이 빨라지는 운영 체계를 만듭니다." },
    ],
  },
  cta: {
    label: "— 05 / Growth Diagnosis",
    headline: "지금의 마케팅 구조를\n진단해보세요.",
    description: "운영 중인 채널과 현재 고민을 남겨주시면 민들레효과가 성장 가능성이 높은 지점을 정리해드립니다.",
    compliance: [
      "Meta, Facebook, Instagram과 공식 제휴 관계를 의미하지 않습니다.",
      "광고 성과는 업종, 예산, 기간, 운영 상태에 따라 달라질 수 있습니다.",
    ],
  },
  common: {
    brandName: "Dandelion Effect",
    corpName: "주식회사 민들레효과",
    contactLabel: "Contact",
    mobileCtaLabel: "무료 성장 진단",
    nav: [
      { label: "About", href: "#about" },
      { label: "Framework", href: "#framework" },
      { label: "Portfolio", href: "#portfolio" },
      { label: "Journal", href: "#journal" },
    ],
    marqueeWords: ["SEARCH", "SPREAD", "CONVERT", "AUTOMATE", "BRAND SYSTEM", "GROWTH STRUCTURE"],
    footerTagline: "주식회사 민들레효과 · Premium Growth Agency",
  },
};
