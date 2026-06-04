import { LandingPage } from "@/components/landing-page";
import { getPublishedCases } from "@/lib/portfolio";
import { getSiteContent } from "@/lib/site-content";
import { getPublishedPosts } from "@/lib/posts";

export default async function Home() {
  const [cases, content, posts] = await Promise.all([getPublishedCases(), getSiteContent(), getPublishedPosts()]);
  return <LandingPage cases={cases} content={content} posts={posts} />;
}
