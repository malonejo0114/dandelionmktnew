import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cormorant_SC, Noto_Serif_KR, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getSiteContent } from "@/lib/site-content";
import { FloatingSocial } from "@/components/floating-social";
import { Analytics } from "@vercel/analytics/react";
import { RefTracker } from "@/components/ref-tracker";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// 종이 리뉴얼(2026-11-12) 글꼴: 한글 명조 · 영문 대문자 · 필기체
const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  variable: "--font-serif-kr",
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: false,
});
const cormorantSc = Cormorant_SC({
  subsets: ["latin"],
  variable: "--font-caps",
  weight: ["500", "600"],
  display: "swap",
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dandelionmkt.co.kr";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteContent();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.title,
      template: seo.titleTemplate,
    },
    description: seo.description,
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
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [
        { url: "/opengraph-image", width: 1200, height: 630, alt: "Dandelion Effect" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: ["/opengraph-image"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#18191B",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();
  return (
    <html lang="ko" className={`${cormorant.variable} ${notoSerifKr.variable} ${cormorantSc.variable} ${pinyon.variable} dark`}>
      <body>
        <SmoothScroll />
        {children}
        <FloatingSocial kakaoUrl={content.common.kakaoUrl} youtubeUrl={content.common.youtubeUrl} />
        <RefTracker />
        <Analytics />
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
