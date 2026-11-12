import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
