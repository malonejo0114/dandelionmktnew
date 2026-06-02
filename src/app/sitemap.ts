import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getPublishedCases } from "@/lib/portfolio";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dandelionmkt.co.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const cases = await getPublishedCases();
  const caseUrls = cases.map((c) => ({
    url: `${siteUrl}/portfolio/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts,
    ...caseUrls,
  ];
}
