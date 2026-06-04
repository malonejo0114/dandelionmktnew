import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getSiteContent } from "@/lib/site-content";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
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
