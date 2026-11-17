import RegionPage, { regionMetadata } from "@/components/RegionPage";

export const metadata = regionMetadata("kootenays");

export default function Page() {
  return <RegionPage id="kootenays" />;
}
