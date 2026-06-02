import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DandelionMark } from "@/components/dandelion-mark";
import { getPublishedCases, getCaseBySlug } from "@/lib/portfolio";

export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const cases = await getPublishedCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCaseBySlug(slug);

  if (!item) {
    return {};
  }

  return {
    title: item.title,
    description: item.summary,
    alternates: {
      canonical: `/portfolio/${slug}`,
    },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.summary,
      url: `/portfolio/${slug}`,
    },
  };
}

export default async function PortfolioCasePage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getCaseBySlug(slug);
  if (!item) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: item.title,
    description: item.summary,
    author: {
      "@type": "Organization",
      name: "Dandelion Effect",
    },
    publisher: {
      "@type": "Organization",
      name: "Dandelion Effect",
    },
  };

  return (
    <main className="min-h-screen bg-[#F4EFE5] px-5 py-10 text-[#18191B] sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-16 border-b border-[#D8CBB7] pb-8">
          <Link href="/" className="mb-14 flex items-center gap-3">
            <DandelionMark className="size-8 text-[#876A35]" />
            <span className="font-display text-lg uppercase tracking-[0.28em]">
              Dandelion Effect
            </span>
          </Link>
          <p className="mb-6 text-xs uppercase tracking-[0.32em] text-[#876A35]">
            {item.industry} · 케이스 스터디
          </p>
          <h1 className="font-kr text-balance text-4xl leading-tight sm:text-6xl">
            {item.title}
          </h1>
          <p className="mt-8 text-lg leading-8 text-[#5E5A52]">{item.summary}</p>
        </header>

        {/* Meta grid */}
        <div className="border-y border-[#D8CBB7] py-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <dt className="font-display mb-1 text-xs uppercase tracking-[0.24em] text-[#876A35]">
                업종 / Industry
              </dt>
              <dd className="font-kr text-sm text-[#18191B]">{item.industry}</dd>
            </div>
            <div>
              <dt className="font-display mb-1 text-xs uppercase tracking-[0.24em] text-[#876A35]">
                결과 / Result
              </dt>
              <dd className="font-kr text-sm font-semibold text-[#876A35]">{item.result}</dd>
            </div>
            <div>
              <dt className="font-display mb-1 text-xs uppercase tracking-[0.24em] text-[#876A35]">
                기간 / Duration
              </dt>
              <dd className="font-kr text-sm text-[#18191B]">{item.duration}</dd>
            </div>
          </dl>
        </div>

        {/* 핵심 요약 — Problem & Strategy */}
        <section className="mt-12 space-y-8">
          <div>
            <p className="font-display mb-3 text-xs uppercase tracking-[0.24em] text-[#876A35]">
              Problem
            </p>
            <p className="font-kr leading-8 text-[#3C3933]">{item.problem}</p>
          </div>
          <div>
            <p className="font-display mb-3 text-xs uppercase tracking-[0.24em] text-[#876A35]">
              Strategy
            </p>
            <p className="font-kr leading-8 text-[#3C3933]">{item.strategy}</p>
          </div>
        </section>

        {/* Detail sections */}
        {item.detail.map((section, i) => (
          <section key={i}>
            <h2 className="font-kr mt-12 text-2xl sm:text-3xl">{section.heading}</h2>
            <p className="font-kr mt-4 leading-8 text-[#3C3933]">{section.body}</p>
          </section>
        ))}

        {/* Footer */}
        <footer className="mt-16 flex flex-wrap items-center gap-6 border-t border-[#D8CBB7] pt-8">
          <Link href="/#portfolio" className="text-sm text-[#876A35]">
            모든 케이스 보기
          </Link>
          <Link
            href="/#cta"
            className="rounded-sm bg-[#D6B77A] px-5 py-2 text-sm font-semibold text-[#18191B] transition-opacity hover:opacity-80"
          >
            무료 성장 진단 받기
          </Link>
        </footer>
      </article>
    </main>
  );
}
