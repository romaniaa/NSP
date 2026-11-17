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
  allowedDevOrigins: ["opn.test"],
  redirects() {
    return [
      // openpeaks.ca is the one canonical host. The old North Shore Peaks
      // domain, .site and the www hosts all point at this project, so send
      // them there, keeping the path and query. Next wraps host values in
      // ^…$; the outer group keeps that anchor around every alternative, so
      // this never matches openpeaks.ca, localhost or preview URLs.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(www\\.openpeaks\\.ca|(www\\.)?openpeaks\\.site|(www\\.)?northshorepeaks\\.com)",
          },
        ],
        destination: "https://openpeaks.ca/:path*",
        permanent: true,
      },
      // My hills moved from /dashboard to the home page. Share links keep their
      // #hash, since browsers carry it across a redirect.
      { source: "/dashboard", destination: "/", permanent: true },
    ];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
