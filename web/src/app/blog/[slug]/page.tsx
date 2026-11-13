import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { getAllPosts, getPost, categorySlug, formatDate } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

// Static export: build one page per post, and nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  return { title: post ? `${post.title} | infracringe` : "infracringe", description: post?.summary };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Posts are newest first, so the "newer" post is the previous item.
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  const newer = posts[index - 1];
  const older = posts[index + 1];

  return (
    <article>
      <h1 className="mb-2 text-xl font-bold">{post.title}</h1>
      <p className="mb-8 text-sm text-neutral-500">
        {formatDate(post.date)} · {post.readingTime} min read ·{" "}
        <Link href={`/categories/${categorySlug(post.category)}/`} className="hover:text-green-400">
          {post.category}
        </Link>
      </p>

      <div className="prose prose-invert prose-neutral max-w-none prose-a:text-green-400 prose-code:before:content-none prose-code:after:content-none">
        <MDXRemote source={post.content} />
      </div>

      <nav className="mt-12 flex justify-between gap-4 text-sm">
        {older ? (
          <Link href={`/blog/${older.slug}/`} className="hover:text-green-400">← {older.title}</Link>
        ) : <span />}
        {newer && (
          <Link href={`/blog/${newer.slug}/`} className="text-right hover:text-green-400">{newer.title} →</Link>
        )}
      </nav>
    </article>
  );
}
