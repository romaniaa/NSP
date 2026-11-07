import { notFound } from "next/navigation";
import { MOUNTAINS } from "@/config/mountains";
import { OG_SIZE, ogAlt, ogImage } from "@/lib/OgImage";
import { SITE_NAME } from "@/lib/Site";

export const alt = ogAlt("Ski conditions");
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return MOUNTAINS.map((m) => ({ mountain: m.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ mountain: string }>;
}) {
  const { mountain } = await params;
  const m = MOUNTAINS.find((x) => x.id === mountain);
  if (!m) notFound();

  return ogImage({
    eyebrow: SITE_NAME,
    title: m.fullName,
    subtitle: "Snow depth, live webcams, and rain or snow at every lift",
    mountains: [m],
  });
}
