import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "columns");

export type ColumnPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingTime: string;
  content: string;
};

export function getAllPosts() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => getPostBySlug(file.replace(/\.mdx$/, "")))
    .filter((post): post is ColumnPost => Boolean(post))
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
}

export function getPostBySlug(slug: string): ColumnPost | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const file = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(file);

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    category: String(data.category ?? "Marketing"),
    date: String(data.date ?? ""),
    readingTime: String(data.readingTime ?? "5 min read"),
    content,
  };
}
