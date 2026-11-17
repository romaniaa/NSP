import RegionPage, { regionMetadata } from "@/components/RegionPage";

export const metadata = regionMetadata("rockies");

export default function Page() {
  return <RegionPage id="rockies" />;
}
