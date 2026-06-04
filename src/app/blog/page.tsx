import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DandelionMark } from "@/components/dandelion-mark";
import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Column",
  description: "민들레효과의 퍼포먼스 마케팅, SEO, 랜딩 전환, 자동화 전략 칼럼입니다.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <main className="min-h-screen bg-[#F4EFE5] px-5 py-10 text-[#18191B] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[#D8CBB7] pb-8">
          <Link href="/" className="flex items-center gap-3">
            <DandelionMark className="size-8" />
            <span className="font-display text-lg uppercase tracking-[0.28em]">Dandelion Effect</span>
          </Link>
          <Link href="/#cta" className="text-sm text-[#876A35]">상담 문의</Link>
        </header>

        <section className="py-20">
          <p className="mb-6 text-xs uppercase tracking-[0.34em] text-[#876A35]">Column</p>
          <h1 className="font-display text-6xl uppercase leading-none tracking-[0.1em] sm:text-8xl">Strategy Journal</h1>
          <p className="mt-8 max-w-2xl font-kr text-lg leading-8 text-[#5E5A52]">광고 운영의 전술보다 브랜드가 검색되고 전환되는 구조를 먼저 다룹니다.</p>
        </section>

        <section className="grid gap-px bg-[#D8CBB7] md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group grid grid-rows-[200px_1fr] bg-[#F4EFE5] transition-colors hover:bg-[#EEE6D7]">
              <div className="relative overflow-hidden bg-[#E6DCC8]">
                {post.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,#18191b,#3a3a3a)]" />
                )}
              </div>
              <div className="flex flex-col justify-between gap-6 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#876A35]">{post.category} · {post.publishedAt?.slice(0, 10)}</p>
                  <h2 className="mt-4 font-kr text-xl font-semibold leading-snug group-hover:text-[#876A35]">{post.title}</h2>
                  <p className="mt-3 font-kr text-sm leading-7 text-[#5E5A52]">{post.excerpt}</p>
                </div>
                <ArrowUpRight className="size-5 text-[#876A35] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
