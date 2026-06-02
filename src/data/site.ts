export const navItems = [
  { label: "About", href: "#about" },
  { label: "Framework", href: "#framework" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Journal", href: "#journal" },
];

export const frameworkItems = [
  {
    code: "SEARCH",
    title: "검색되는 구조",
    body: "고객이 문제를 검색하는 순간 브랜드가 발견되도록 SEO, 콘텐츠, 랜딩의 언어를 정렬합니다.",
  },
  {
    code: "SPREAD",
    title: "퍼지는 구조",
    body: "광고 소재와 메시지 실험을 통해 기억에 남는 후킹 포인트를 반복적으로 찾아냅니다.",
  },
  {
    code: "CONVERT",
    title: "전환되는 구조",
    body: "문의DB, 상담 흐름, CTA, 폼 마찰을 함께 보며 광고 이후의 병목을 줄입니다.",
  },
  {
    code: "AUTOMATE",
    title: "쌓이는 구조",
    body: "리포트, CRM, 자동화 루틴을 연결해 다음 실험이 빨라지는 운영 체계를 만듭니다.",
  },
];

// video/poster: 지금은 임시로 hero 영상/포스터를 공유한다.
// 카드별 영상을 만들면 public/case-1.mp4 ... 로 넣고 아래 video 값만 바꾸면 된다.
// slug/summary/detail: /portfolio/[slug] 상세 페이지용. 추후 관리자 페이지에서 교체될 placeholder.
export const portfolioCases = [
  {
    slug: "skin-clinic-search",
    industry: "피부과",
    title: "검색 유입 구조 개선",
    problem: "검색 유입은 있었지만 랜딩 메시지와 상담 문의 흐름이 분리되어 있었습니다.",
    strategy: "SEO 콘텐츠, 랜딩페이지 카피, 상담 CTA를 하나의 검색 의도에 맞춰 재설계했습니다.",
    result: "상담 전환 증가",
    duration: "4개월",
    video: "/hero.mp4",
    poster: "/hero-poster.jpg",
    summary: "검색 유입과 상담 흐름을 하나의 구조로 정렬해 상담 전환을 끌어올린 피부과 케이스입니다.",
    detail: [
      { heading: "배경", body: "내원 문의를 만드는 검색 유입은 있었지만, 검색 의도와 랜딩 메시지, 상담 CTA가 서로 다른 언어로 흩어져 있어 방문이 상담으로 이어지지 않았습니다." },
      { heading: "접근", body: "핵심 검색 키워드를 상담 의사결정 순서로 재정의하고, SEO 콘텐츠·랜딩 카피·상담 CTA를 하나의 흐름으로 다시 설계했습니다." },
      { heading: "결과", body: "검색 유입의 상담 전환이 개선되었고, 어떤 키워드가 상담으로 이어지는지 반복 측정 가능한 구조가 남았습니다." },
    ],
  },
  {
    slug: "education-funnel",
    industry: "교육 서비스",
    title: "상담 퍼널 재정렬",
    problem: "광고 클릭 이후 문의DB가 충분히 쌓이지 않고 상담 품질 편차가 컸습니다.",
    strategy: "소재 후킹, 랜딩 구조, 문의폼 필드를 상담 의사결정 순서에 맞춰 정리했습니다.",
    result: "문의 완료율 개선",
    duration: "8주",
    video: "/hero.mp4",
    poster: "/hero-poster.jpg",
    summary: "광고 이후의 병목을 소재·랜딩·문의폼까지 한 흐름으로 정리해 문의 완료율을 높인 교육 서비스 케이스입니다.",
    detail: [
      { heading: "배경", body: "광고 클릭은 발생했지만 문의DB가 충분히 쌓이지 않았고, 들어온 상담의 품질 편차도 컸습니다." },
      { heading: "접근", body: "소재의 후킹 포인트, 랜딩 구조, 문의폼 필드를 상담 의사결정 순서에 맞춰 재정렬했습니다." },
      { heading: "결과", body: "문의 완료율이 개선되고, 상담 전 단계에서 더 정제된 정보가 쌓이는 퍼널이 만들어졌습니다." },
    ],
  },
  {
    slug: "local-brand-system",
    industry: "로컬 브랜드",
    title: "브랜드 확산 시스템 구축",
    problem: "콘텐츠, 광고, 고객 후기가 각각 따로 운영되어 브랜드 기억이 누적되지 않았습니다.",
    strategy: "검색 키워드, 리뷰 메시지, 광고 소재, 리타겟팅 흐름을 같은 브랜드 언어로 연결했습니다.",
    result: "브랜드 검색 신호 강화",
    duration: "12주",
    video: "/hero.mp4",
    poster: "/hero-poster.jpg",
    summary: "흩어져 있던 콘텐츠·광고·후기를 하나의 브랜드 언어로 연결해 브랜드 검색 신호를 키운 로컬 브랜드 케이스입니다.",
    detail: [
      { heading: "배경", body: "콘텐츠, 광고, 고객 후기가 각각 따로 운영되어 브랜드 기억이 누적되지 않았습니다." },
      { heading: "접근", body: "검색 키워드, 리뷰 메시지, 광고 소재, 리타겟팅 흐름을 같은 브랜드 언어로 묶어 하나의 확산 구조로 연결했습니다." },
      { heading: "결과", body: "브랜드명 검색 신호가 강화되고, 채널마다 흩어졌던 메시지가 누적되는 자산이 되었습니다." },
    ],
  },
];

export const columnPreviews = [
  {
    slug: "meta-campaign-structure",
    category: "Marketing",
    title: "Meta 광고 캠페인 구조를 다시 봐야 하는 순간",
    date: "2026.06.01",
  },
  {
    slug: "landing-conversion-audit",
    category: "Landing Page",
    title: "문의DB가 쌓이지 않는 랜딩페이지의 공통 병목",
    date: "2026.06.01",
  },
  {
    slug: "brand-search-system",
    category: "SEO",
    title: "검색되는 브랜드가 되기 위한 콘텐츠 설계",
    date: "2026.06.01",
  },
];

export const marqueeWords = [
  "SEARCH",
  "SPREAD",
  "CONVERT",
  "AUTOMATE",
  "BRAND SYSTEM",
  "GROWTH STRUCTURE",
];
