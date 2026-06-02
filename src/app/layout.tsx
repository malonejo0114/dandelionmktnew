import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dandelionmkt.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dandelion Effect | 브랜드가 퍼지는 구조를 설계합니다",
    template: "%s | Dandelion Effect",
  },
  description:
    "주식회사 민들레효과는 브랜드가 검색되고, 기억되고, 확산되고, 전환되는 구조를 설계하는 프리미엄 마케팅 에이전시입니다.",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "Dandelion Effect",
    title: "Dandelion Effect | 브랜드 성장 설계 회사",
    description:
      "광고 운영을 넘어 검색, 확산, 전환, 자동화까지 이어지는 성장 구조를 설계합니다.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dandelion Effect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dandelion Effect | 브랜드 성장 설계 회사",
    description:
      "브랜드가 검색되고, 기억되고, 확산되고, 전환되는 구조를 설계합니다.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#18191B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${cormorant.variable} dark`}
    >
      <body>
        <SmoothScroll />
        {children}
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
