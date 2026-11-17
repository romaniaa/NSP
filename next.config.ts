import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  allowedDevOrigins: ["nsp.test"],
  // My hills moved from /dashboard to the home page. Share links keep their
  // #hash, since browsers carry it across a redirect.
  redirects() {
    return [{ source: "/dashboard", destination: "/", permanent: true }];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
