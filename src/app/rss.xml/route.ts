import { getAllPosts } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dandelionmkt.co.kr";

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${siteUrl}/blog/${post.slug}</link>
  <guid>${siteUrl}/blog/${post.slug}</guid>
  <description>${escapeXml(post.description)}</description>
  <pubDate>${new Date(post.date).toUTCString()}</pubDate>
</item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Dandelion Effect Column</title>
  <link>${siteUrl}/blog</link>
  <description>브랜드 성장 구조, 퍼포먼스 마케팅, 랜딩 전환, SEO 칼럼</description>
  <language>ko-KR</language>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
