import { LandingPage } from "@/components/landing-page";
import { getPublishedCases } from "@/lib/portfolio";

export default async function Home() {
  const cases = await getPublishedCases();
  return <LandingPage cases={cases} />;
}
