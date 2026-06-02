import { LandingPage } from "@/components/landing-page";
import { getPublishedCases } from "@/lib/portfolio";
import { getSiteContent } from "@/lib/site-content";

export default async function Home() {
  const [cases, content] = await Promise.all([getPublishedCases(), getSiteContent()]);
  return <LandingPage cases={cases} content={content} />;
}
