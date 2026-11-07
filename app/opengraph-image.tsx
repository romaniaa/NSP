import { MOUNTAINS } from "@/config/mountains";
import { OG_SIZE, ogAlt, ogImage } from "@/lib/OgImage";
import { SITE_NAME } from "@/lib/Site";

export const alt = ogAlt("North Shore ski conditions");
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: SITE_NAME,
    title: "North Shore ski conditions",
    subtitle: "Cypress · Grouse · Seymour: snow depth, webcams, rain or snow",
    mountains: MOUNTAINS,
  });
}
