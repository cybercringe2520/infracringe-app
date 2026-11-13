import PostList from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";

export default function Blog() {
  const posts = getAllPosts();

  // Group posts by year: { "2026": [...], "2025": [...] }
  const byYear = new Map<string, typeof posts>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }

  return (
    <>
      <h1 className="mb-8 font-bold">$ ls /blog</h1>
      {[...byYear.entries()].map(([year, yearPosts]) => (
        <section key={year} className="mb-10">
          <h2 className="mb-4 text-neutral-500">{year}</h2>
          <PostList posts={yearPosts} />
        </section>
      ))}
    </>
  );
}
