import RegionPage, { regionMetadata } from "@/components/RegionPage";

export const metadata = regionMetadata("coast");

export default function Page() {
  return <RegionPage id="coast" />;
}
