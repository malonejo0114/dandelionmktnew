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

// 실제 X 성과 사례 3건 (2026-11-12). 수치: X 게시물 애널리틱스 캡처 기준
// (원본 D:\Ai\민들레효과 바이럴\트위터 바이럴 레퍼런스_브랜드별, 정리 00_분석_잘된 형식 정리.md). SMM 주문 글 아님.
// 영상: 민들레효과 모션 RealCase* 컴포지션 (아이디·프사·본문·사진 모자이크). 브랜드명은 고객사 동의 전이라 업종으로만 표기.
// 운영 사이트는 관리자 포트폴리오(DB)가 우선이므로, 이 값은 DB가 비었을 때의 기본값 + 관리자 입력용 원본이다.
export const portfolioCases = [
  {
    slug: "eyecare-quote-spread",
    industry: "아이케어 브랜드",
    title: "인용 확산으로 두 번 터진 시딩 콘텐츠",
    problem: "신규 아이패치 제품을 X에서 알리고, 관심을 실제 상품 페이지 방문으로 이어야 했습니다.",
    strategy: "원글은 사용 경험의 '깨달음' 이야기로만 쓰고, 제품 링크는 첫 답글 하나로 분리했습니다. 반응이 오자 셀럽 사용 장면으로 원글을 인용해 2차 확산을 만들었습니다.",
    result: "링크 클릭 13,326 · CTR 34.0%",
    duration: "2026년 8월",
    video: "/media/cases/real-eyecare.mp4",
    poster: "/media/cases/real-eyecare.jpg",
    summary: "원글 216만·인용글 200만 조회, 링크 댓글 클릭률 34%를 만든 아이케어 브랜드 케이스입니다.",
    detail: [
      { heading: "배경", body: "신규 아이패치 제품을 광고 집행 없이 X에서 알리고, 관심을 상품 페이지 방문까지 연결해야 했습니다." },
      { heading: "접근", body: "원글에는 제품명을 쓰지 않고 '나 이제 알았다' 같은 1인칭 깨달음과 클로즈업 실사로 궁금증을 만들었습니다. 첫 답글에는 상품 링크 하나만 두어 고를 필요 없이 바로 이동하게 했고, 반응이 오른 뒤에는 셀럽 사용 장면으로 원글을 인용해 확산을 한 번 더 일으켰습니다." },
      { heading: "결과", body: "원글 조회 216만, 인용글 조회 200만. 링크 답글은 노출 39,217회 중 13,326회 클릭되어 CTR 34.0%를 기록했습니다. (X 게시물 애널리틱스 기준)" },
    ],
  },
  {
    slug: "bodycare-question-quote",
    industry: "바디케어 브랜드",
    title: "고민 질문글에 올라탄 333만 조회 콘텐츠",
    problem: "착색처럼 이미 대화가 많은 고민 주제에서, 브랜드를 자연스럽게 연결할 접점이 필요했습니다.",
    strategy: "실제 고민 질문글을 인용해 관심 있는 사람들이 모인 대화에 들어가고, 비포/애프터 실사 2장으로 설득한 뒤 첫 답글에 자사몰 링크 하나만 두었습니다.",
    result: "링크 클릭 22,879 · CTR 10.2%",
    duration: "2026년 9월",
    video: "/media/cases/real-bodycare.mp4",
    poster: "/media/cases/real-bodycare.jpg",
    summary: "원글 333만 조회, 링크 답글 클릭 22,879회를 만든 바디케어 브랜드 케이스입니다.",
    detail: [
      { heading: "배경", body: "제품 카테고리 자체가 검색과 대화가 많은 고민 주제였지만, 브랜드가 그 대화에 들어갈 접점이 없었습니다." },
      { heading: "접근", body: "고민을 묻는 질문글을 인용해 이미 관심이 모인 판에 올라타고, 비포/애프터 실사 2장과 짧은 해결 문장으로 설득했습니다. 링크는 원글 바로 아래 첫 답글 하나로 모았습니다." },
      { heading: "결과", body: "원글 조회 333만. 링크 답글은 노출 22.5만회 중 22,879회 클릭되어 CTR 10.2%를 기록했습니다. (X 게시물 애널리틱스 기준)" },
    ],
  },
  {
    slug: "skincare-chain-quote",
    industry: "스킨케어 브랜드",
    title: "인용으로 이어 붙인 연쇄 바이럴",
    problem: "한 번 반응을 얻은 콘텐츠가 금방 식지 않도록, 확산을 이어 갈 구조가 필요했습니다.",
    strategy: "반응이 온 첫 글을 이어받는 후속 인용글을 설계해 같은 관심사를 한 번 더 모았고, 두 글 모두 첫 답글에 링크 하나만 붙였습니다.",
    result: "링크 클릭 35,715 · CTR 23.8%",
    duration: "2026년 8월",
    video: "/media/cases/real-skincare.mp4",
    poster: "/media/cases/real-skincare.jpg",
    summary: "두 글 합산 252만 조회, 링크 클릭 35,715회를 만든 스킨케어 브랜드 케이스입니다.",
    detail: [
      { heading: "배경", body: "첫 콘텐츠가 반응을 얻었지만, 단발성으로 끝나면 브랜드 기억이 쌓이지 않는 상황이었습니다." },
      { heading: "접근", body: "첫 글의 반응을 이어받는 고백형 후속 글이 원글을 인용하도록 설계해 같은 관심사를 다시 모았습니다. 두 글 모두 원글엔 제품명을 숨기고, 첫 답글에 링크 하나만 두었습니다." },
      { heading: "결과", body: "첫 글 67.7만, 후속 인용글 184.4만 조회. 링크 답글 클릭은 19,781회(CTR 26.1%)와 15,934회(CTR 21.4%), 합산 35,715회입니다. (X 게시물 애널리틱스 기준)" },
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
