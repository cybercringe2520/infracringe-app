import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "infracringe",
  description: "DevOps and DevSecOps notes by cybercringe",
  // Lets browsers and feed readers find the RSS feed automatically.
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

const nav = [
  { href: "/", label: "home" },
  { href: "/blog/", label: "blog" },
  { href: "/categories/", label: "categories" },
  { href: "/search/", label: "search" },
  { href: "/contact/", label: "contact" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-2xl px-4 py-8 font-mono bg-neutral-950 text-neutral-200">
        <header className="mb-10 flex flex-wrap gap-4">
          <Link href="/" className="font-bold text-green-400">infracringe</Link>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-green-400">
              {item.label}
            </Link>
          ))}
        </header>
        <main id="main">{children}</main>
        <footer className="mt-16 flex gap-4 text-sm text-neutral-500">
          <span>© 2026 infracringe</span>
          <a href="/feed.xml" className="hover:text-green-400">rss</a>
        </footer>
      </body>
    </html>
  );
}
