import RegionPage, { regionMetadata } from "@/components/RegionPage";

export const metadata = regionMetadata("okanagan");

export default function Page() {
  return <RegionPage id="okanagan" />;
}
