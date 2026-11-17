import { MOUNTAINS } from "@/config/mountains";
import { OG_SIZE, ogAlt, ogImage } from "@/lib/OgImage";
import { SITE_NAME } from "@/lib/Site";

export const alt = ogAlt("Ski conditions in BC and the Rockies");
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: SITE_NAME,
    title: "Ski conditions in BC and the Rockies",
    subtitle: "26 hills and 8 backcountry zones: temperature, snow depth, rain or snow",
    mountains: MOUNTAINS.filter((m) => ["cypress", "whistler", "revelstoke"].includes(m.id)),
  });
}
