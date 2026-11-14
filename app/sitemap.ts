import type { MetadataRoute } from "next";
import { MOUNTAINS } from "@/config/mountains";
import { ZONES } from "@/config/zones";
import { SITE_URL } from "@/lib/Site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
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
  ];
}
