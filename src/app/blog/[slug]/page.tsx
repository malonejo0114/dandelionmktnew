import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { DandelionMark } from "@/components/dandelion-mark";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
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
        <header className="mb-16 border-b border-[#D8CBB7] pb-8">
          <Link href="/" className="mb-14 flex items-center gap-3">
            <DandelionMark className="size-8 text-[#876A35]" />
            <span className="font-display text-lg uppercase tracking-[0.28em]">
              Dandelion Effect
            </span>
          </Link>
          <p className="mb-6 text-xs uppercase tracking-[0.32em] text-[#876A35]">
            {post.category} · {post.date} · {post.readingTime}
          </p>
          <h1 className="font-serif-kr text-balance text-4xl leading-tight sm:text-6xl">
            {post.title}
          </h1>
          <p className="mt-8 text-lg leading-8 text-[#5E5A52]">{post.description}</p>
        </header>

        <div className="article-content">
          <MDXRemote source={post.content} />
        </div>

        <footer className="mt-16 border-t border-[#D8CBB7] pt-8">
          <Link href="/blog" className="text-sm text-[#876A35]">
            모든 칼럼 보기
          </Link>
        </footer>
      </article>
    </main>
  );
}
