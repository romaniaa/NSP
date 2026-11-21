import type { MetadataRoute } from "next";
import { MOUNTAINS } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import { ZONES } from "@/config/zones";
import { SITE_URL } from "@/lib/Site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    ...REGIONS.map((r) => ({
      url: `${SITE_URL}/${r.id}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/backcountry`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/hills`, changeFrequency: "hourly", priority: 0.8 },
    ...MOUNTAINS.map((m) => ({
      url: `${SITE_URL}/${m.id}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),
    ...ZONES.map((z) => ({
      url: `${SITE_URL}/backcountry/${z.id}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
