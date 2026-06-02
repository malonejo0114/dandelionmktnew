import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      // 관리자 영상/포스터 업로드를 위해 서버 액션 본문 한도 상향 (기본 1MB)
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
