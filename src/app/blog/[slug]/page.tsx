import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DandelionMark } from "@/components/dandelion-mark";
import { getPublishedPosts, getPostBySlug } from "@/lib/posts";

export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post.coverUrl ? { images: [{ url: post.coverUrl }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary || post.excerpt,
    ...(post.coverUrl ? { image: post.coverUrl } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt, dateModified: post.publishedAt } : {}),
    author: { "@type": "Organization", name: "Dandelion Effect" },
    publisher: { "@type": "Organization", name: "Dandelion Effect" },
  };
  const faqLd = post.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <main className="min-h-screen bg-[#F4EFE5] px-5 py-10 text-[#18191B] sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPosting) }} />
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} /> : null}

      <article className="mx-auto max-w-3xl">
        <header className="mb-12 border-b border-[#D8CBB7] pb-8">
          <Link href="/" className="mb-12 flex items-center gap-3">
            <DandelionMark className="size-8" />
            <span className="font-display text-lg uppercase tracking-[0.28em]">Dandelion Effect</span>
          </Link>
          <p className="mb-6 text-xs uppercase tracking-[0.32em] text-[#876A35]">
            {post.category}{post.publishedAt ? ` · ${post.publishedAt.slice(0, 10)}` : ""} · {post.readingTime}
          </p>
          <h1 className="text-balance font-kr text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-6 font-kr text-lg leading-8 text-[#5E5A52]">{post.excerpt}</p> : null}
          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt="" className="mt-8 w-full rounded-lg object-cover" />
          ) : null}
        </header>

        {post.summary ? (
          <div className="mb-10 border-l-2 border-[#876A35] bg-[#EEE6D7] p-5">
            <p className="mb-1 font-display text-[11px] uppercase tracking-[0.2em] text-[#876A35]">요약</p>
            <p className="font-kr leading-8 text-[#3C382F]">{post.summary}</p>
          </div>
        ) : null}

        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

        {post.faqs.length ? (
          <section className="mt-16 border-t border-[#D8CBB7] pt-10">
            <h2 className="font-kr text-2xl font-bold">자주 묻는 질문</h2>
            <div className="mt-6 grid gap-6">
              {post.faqs.map((f, i) => (
                <div key={i}>
                  <p className="font-kr text-lg font-semibold">{f.q}</p>
                  <p className="mt-2 font-kr leading-8 text-[#5E5A52]">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="mt-16 border-t border-[#D8CBB7] pt-8">
          <Link href="/blog" className="text-sm text-[#876A35]">모든 칼럼 보기</Link>
        </footer>
      </article>
    </main>
  );
}
