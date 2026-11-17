import RegionPage, { regionMetadata } from "@/components/RegionPage";

export const metadata = regionMetadata("vancouver-island");

export default function Page() {
  return <RegionPage id="vancouver-island" />;
}
