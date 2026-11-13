import fs from "node:fs";
import path from "node:path";
import { getFrontmatter } from "next-mdx-remote-client/utils";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type Frontmatter = {
  title: string;
  date: string | Date;
  summary: string;
  category: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  category: string;
  readingTime: number; // minutes
};

export type Post = PostMeta & { content: string };

// Read one .mdx file and split it into frontmatter (metadata) and content.
function readPost(file: string): Post {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { frontmatter, strippedSource } = getFrontmatter<Frontmatter>(raw);

  const words = strippedSource.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: frontmatter.title,
    date: new Date(frontmatter.date).toISOString().slice(0, 10),
    summary: frontmatter.summary,
    category: frontmatter.category,
    readingTime: Math.max(1, Math.round(words / 200)),
    content: strippedSource,
  };
}

// All posts, newest first.
export function getAllPosts(): Post[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

// "Cloud Security" -> "cloud-security", used in URLs.
export function categorySlug(category: string): string {
  return category.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
}

// Each category with its number of posts, sorted by name.
export function getCategories(): { name: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, slug: categorySlug(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// "2026-11-13" -> "13 Nov 2026"
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
