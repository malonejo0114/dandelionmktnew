import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 로컬 경로에 한글 폴더(민들레효과 홈페이지)가 있고 상위 D:\Ai 에도 lockfile 이 있어, 루트를 프로젝트로 고정한다.
  // (안 하면 Turbopack 이 한글 경로로 청크 이름을 만들다 /portfolio/[slug] 에서 패닉, 2026-11-12)
  turbopack: { root: process.cwd() },
  // 첫 화면 영상·포스터는 1년 캐시. 파일을 바꿀 땐 파일명을 바꾼다.
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000" }],
      },
    ];
  },
  experimental: {
    serverActions: {
      // 관리자 영상/포스터 업로드를 위해 서버 액션 본문 한도 상향 (기본 1MB)
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
