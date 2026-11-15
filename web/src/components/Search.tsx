"use client";

import { useEffect, useRef, useState } from "react";

type Result = { url: string; title: string; excerpt: string };

// The parts of the Pagefind browser API used here.
type Pagefind = {
  search: (query: string) => Promise<{
    results: { data: () => Promise<{ url: string; meta: { title?: string }; excerpt: string }> }[];
  }>;
};

// Searches the static index that Pagefind builds into /pagefind after `next build`.
// Everything runs in the browser: no server or API involved.
export default function Search() {
  const pagefind = useRef<Pagefind | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [unavailable, setUnavailable] = useState(false);

  // Load the Pagefind script once, from the built site (not bundled by Next.js).
  useEffect(() => {
    const url = "/pagefind/pagefind.js";
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
      .then((module) => {
        pagefind.current = module as Pagefind;
      })
      .catch(() => setUnavailable(true)); // e.g. npm run dev, where no index exists
  }, []);

  // Search 200 ms after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!pagefind.current || query.trim() === "") {
        setResults([]);
        return;
      }
      const search = await pagefind.current.search(query);
      const data = await Promise.all(search.results.slice(0, 10).map((r) => r.data()));
      setResults(data.map((d) => ({ url: d.url, title: d.meta.title ?? d.url, excerpt: d.excerpt })));
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (unavailable) {
    return <p className="text-neutral-500">search is only available in the built site (make up)</p>;
  }

  return (
    <>
      <label className="mb-8 flex items-center gap-2 border border-neutral-700 bg-neutral-900 px-3 py-2 focus-within:border-green-400">
        <span className="text-green-400">$</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search articles..."
          aria-label="Search articles"
          autoFocus
          className="w-full bg-transparent text-neutral-200 outline-none"
        />
      </label>

      {query.trim() !== "" && results.length === 0 && <p className="text-neutral-500">no results</p>}

      <ul className="space-y-4">
        {results.map((r) => (
          <li key={r.url}>
            <a href={r.url} className="text-green-400 hover:underline">
              {r.title}
            </a>
            {/* Pagefind builds the excerpt from our own pages and marks matches with <mark> */}
            <p
              className="text-sm text-neutral-400 [&_mark]:bg-transparent [&_mark]:text-green-300"
              dangerouslySetInnerHTML={{ __html: r.excerpt }}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
