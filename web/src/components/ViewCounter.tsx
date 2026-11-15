"use client";

import { useEffect, useRef, useState } from "react";

// Counts one view for this article and shows the total.
// Runs in the browser after the static page loads, and calls the Go API.
export default function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);
  const counted = useRef(false); // stops a double count in development mode

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;

    fetch(`/api/views/${slug}`, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setViews(data.views);
      })
      .catch(() => {
        // API not reachable (e.g. npm run dev without the backend): show nothing
      });
  }, [slug]);

  if (views === null) return null;
  return <> · {views} views</>;
}
