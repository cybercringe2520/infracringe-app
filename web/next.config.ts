import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",              // build plain HTML/CSS/JS into web/out
  trailingSlash: true,           // /blog/ instead of /blog (works on S3 and nginx)
  images: { unoptimized: true }, // image optimisation needs a server

  // Run every CSS file through Tailwind
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
