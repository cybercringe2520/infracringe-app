import Link from "next/link";
import { getCategories } from "@/lib/posts";

export default function Categories() {
  const categories = getCategories();

  return (
    <>
      <h1 className="mb-6 font-bold">$ tree /categories</h1>
      <p className="text-neutral-500">/categories</p>
      <ul>
        {categories.map((category, i) => (
          <li key={category.slug}>
            <span className="text-neutral-500">{i === categories.length - 1 ? "└── " : "├── "}</span>
            <Link href={`/categories/${category.slug}/`} className="text-green-400 hover:underline">
              {category.name}
            </Link>
            <span className="text-neutral-500"> ({category.count})</span>
          </li>
        ))}
      </ul>
    </>
  );
}
