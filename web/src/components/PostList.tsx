import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";

// A list of posts: date, linked title and one-line summary.
export default function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <span className="mr-3 text-neutral-500">{formatDate(post.date)}</span>
          <Link href={`/blog/${post.slug}/`} className="text-green-400 hover:underline">
            {post.title}
          </Link>
          <p className="text-sm text-neutral-400">{post.summary}</p>
        </li>
      ))}
    </ul>
  );
}
