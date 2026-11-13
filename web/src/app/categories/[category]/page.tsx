import type { Metadata } from "next";
import PostList from "@/components/PostList";
import { getAllPosts, getCategories, categorySlug } from "@/lib/posts";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = getCategories().find((c) => c.slug === category)?.name ?? category;
  return { title: `${name} | infracringe` };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const name = getCategories().find((c) => c.slug === category)?.name ?? category;
  const posts = getAllPosts().filter((post) => categorySlug(post.category) === category);

  return (
    <>
      <h1 className="mb-8 font-bold">$ ls /categories/{category}</h1>
      <p className="mb-6 text-neutral-500">{posts.length} articles in {name}</p>
      <PostList posts={posts} />
    </>
  );
}
