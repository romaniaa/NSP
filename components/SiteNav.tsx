import NavClient from "@/components/NavClient";
import { getNavStatus, type NavStatus } from "@/lib/Places";

// Loads a one-line status per hill and zone for the mobile nav drawer, from the
// same hourly caches the pages use, so it costs no extra API calls. The nav still
// renders without it.
export default async function SiteNav() {
  let status: NavStatus | null = null;
  try {
    status = await getNavStatus();
  } catch (err) {
    console.error("Nav status failure:", err);
  }
  return <NavClient status={status} />;
}
