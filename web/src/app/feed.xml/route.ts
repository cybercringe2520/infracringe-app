import { getAllPosts } from "@/lib/posts";

// Built once at build time into out/feed.xml (static export).
export const dynamic = "force-static";

const SITE = "https://infracringe.dev"; // change when the real domain is set up

// Escape characters that have a special meaning in XML.
function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = getAllPosts()
    .map(
      (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${SITE}/blog/${post.slug}/</link>
      <guid>${SITE}/blog/${post.slug}/</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${escape(post.category)}</category>
      <description>${escape(post.summary)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>infracringe</title>
    <link>${SITE}/</link>
    <description>DevOps and DevSecOps notes, writeups and projects</description>
    <language>en</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
