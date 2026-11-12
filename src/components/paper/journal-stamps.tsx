import Link from "next/link";
import { Reveal } from "@/components/paper/reveal";
import type { Post } from "@/lib/posts";

/** 05 Journal — B 소인 찍힌 카드: 카드가 들어오고 날짜 소인이 꽝 찍힌다. 최신 글 3개. */
export function JournalStamps({ posts }: { posts: Post[] }) {
  const items = posts.slice(0, 3);
  if (items.length === 0) return null;
  return (
    <Reveal className="sec s5" id="journal">
      <div className="wrap">
        <div className="s-head">
          <div className="eyebrow x rise" style={{ ["--d" as string]: 0 }}>
            <span className="seed" />
            Editorial Authority
          </div>
          <h2 className="x rise" style={{ ["--d" as string]: 1 }}>
            {"SEO 유입을 위한 글도 가벼운 팁이 아니라,\n대표자가 의사결정을 내릴 수 있는 전략 문서처럼 설계합니다."}
          </h2>
        </div>

        <div className="posts">
          {items.map((post, i) => {
            const date = post.publishedAt?.slice(0, 10) ?? "";
            const [y, m, d] = date ? date.split("-") : ["", "", ""];
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="post x slide" style={{ ["--d" as string]: 2 + i * 3 }}>
                {date ? (
                  <svg className="mark x stamp" style={{ ["--d" as string]: 4 + i * 3 }} viewBox="0 0 76 76" role="img" aria-label={`발행일 ${date}`}>
                    <circle cx="38" cy="38" r="35" strokeWidth="1.6" />
                    <circle cx="38" cy="38" r="27" strokeWidth="0.8" />
                    <text x="38" y="30" textAnchor="middle" fontSize="8" letterSpacing="2">
                      {y}
                    </text>
                    <text x="38" y="46" textAnchor="middle" fontSize="15" fontWeight="600">
                      {m}.{d}
                    </text>
                    <text x="38" y="58" textAnchor="middle" fontSize="6.5" letterSpacing="1.5">
                      SEOUL
                    </text>
                  </svg>
                ) : null}
                <div className="cat">{post.category}</div>
                <h3>{post.title}</h3>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
                <span className="go">Read →</span>
              </Link>
            );
          })}
        </div>

        <div className="all x rise" style={{ ["--d" as string]: 12 }}>
          <Link href="/blog" className="btn">
            전체 칼럼 보기
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
