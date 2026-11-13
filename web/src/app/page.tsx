import Link from "next/link";
import PostList from "@/components/PostList";
import { getAllPosts, formatDate } from "@/lib/posts";
import { getProjects } from "@/lib/projects";

export default function Home() {
  const recent = getAllPosts().slice(0, 3);
  const projects = getProjects();

  return (
    <>
      <p className="mb-10 text-neutral-400">
        $ whoami
        <br />
        DevOps and DevSecOps notes, writeups and projects.
      </p>

      <section className="mb-12">
        <h2 className="mb-4 font-bold">recent articles</h2>
        <PostList posts={recent} />
        <Link href="/blog/" className="mt-4 inline-block text-sm text-neutral-500 hover:text-green-400">
          all articles →
        </Link>
      </section>

      <section>
        <h2 className="mb-4 font-bold">certifications &amp; projects</h2>
        <ul className="space-y-3">
          {projects.map((item) => (
            <li key={item.name}>
              <span className="mr-3 text-neutral-500">{formatDate(item.date)}</span>
              {item.url ? (
                <a href={item.url} className="text-green-400 hover:underline">{item.name}</a>
              ) : (
                <span className="text-green-400">{item.name}</span>
              )}
              <span className="ml-2 text-sm text-neutral-500">({item.type})</span>
              {item.description && <p className="text-sm text-neutral-400">{item.description}</p>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
