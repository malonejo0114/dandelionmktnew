import Link from "next/link";
import type { Post } from "@/lib/posts";

export function Journal({ posts }: { posts: Post[] }) {
  const items = posts.slice(0, 3);
  return (
    <section id="journal" className="bg-[#F4EFE5] px-5 py-24 text-[#111214] sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-14 text-center">
          <h2 className="font-display text-5xl uppercase leading-[0.95] tracking-[0.03em] sm:text-7xl lg:text-8xl">Editorial Authority</h2>
          <p className="mx-auto mt-6 max-w-2xl font-kr text-base leading-8 text-[#59564F]">SEO 유입을 위한 글도 가벼운 팁이 아니라, 대표자가 의사결정을 내릴 수 있는 전략 문서처럼 설계합니다.</p>
        </div>

        <div className="grid gap-px bg-[#D9CCB5] md:grid-cols-3">
          {items.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} data-reveal className="group grid min-h-[460px] grid-rows-[200px_1fr] bg-[#F4EFE5] transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#111214] hover:text-[#F4EFE5]">
              <div className="relative overflow-hidden bg-[#18191b]">
                {post.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverUrl} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,rgba(17,18,20,0.82),rgba(17,18,20,0.28)),radial-gradient(circle_at_28%_24%,rgba(214,183,122,0.42),transparent_9rem),#18191b]" />
                )}
                <p className="absolute bottom-6 left-6 font-display text-5xl uppercase tracking-[0.1em] text-[#F4EFE5]">{`0${i + 1}`}</p>
              </div>
              <div className="flex flex-col justify-between p-7">
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.24em] text-[#8F6E32] group-hover:text-[#D6B77A]">{post.category}{post.publishedAt ? ` · ${post.publishedAt.slice(0, 10)}` : ""}</p>
                  <h3 className="mt-7 font-kr text-xl font-medium leading-snug">{post.title}</h3>
                </div>
                <div className="mt-10 h-px w-full bg-[#D6B77A]/55 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-2/3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
