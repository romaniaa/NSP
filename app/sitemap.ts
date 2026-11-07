import type { MetadataRoute } from "next";
import { MOUNTAINS } from "@/config/mountains";
import { SITE_URL } from "@/lib/Site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    ...MOUNTAINS.map((m) => ({
      url: `${SITE_URL}/${m.id}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),
  ];
}
