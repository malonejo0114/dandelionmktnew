import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DandelionMark } from "@/components/dandelion-mark";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Column",
  description: "민들레효과의 퍼포먼스 마케팅, SEO, 랜딩 전환, 자동화 전략 칼럼입니다.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[#F4EFE5] px-5 py-10 text-[#18191B] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[#D8CBB7] pb-8">
          <Link href="/" className="flex items-center gap-3">
            <DandelionMark className="size-8 text-[#876A35]" />
            <span className="font-display text-lg uppercase tracking-[0.28em]">
              Dandelion Effect
            </span>
          </Link>
          <Link href="/#cta" className="text-sm text-[#876A35]">
            상담 문의
          </Link>
        </header>

        <section className="py-20">
          <p className="mb-6 text-xs uppercase tracking-[0.34em] text-[#876A35]">Column</p>
          <h1 className="font-display text-6xl uppercase leading-none tracking-[0.1em] sm:text-8xl">
            Strategy Journal
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5E5A52]">
            광고 운영의 전술보다 브랜드가 검색되고 전환되는 구조를 먼저 다룹니다.
          </p>
        </section>

        <section className="grid gap-px bg-[#D8CBB7]">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group grid gap-8 bg-[#F4EFE5] p-6 transition-colors hover:bg-[#EEE6D7] md:grid-cols-[0.35fr_1fr_auto] md:p-8"
            >
              <p className="text-xs uppercase tracking-[0.28em] text-[#876A35]">
                {post.category}
              </p>
              <div>
                <h2 className="font-serif-kr text-3xl leading-tight group-hover:text-[#876A35]">
                  {post.title}
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-[#5E5A52]">{post.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#876A35]">
                {post.date}
                <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
