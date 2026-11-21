import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CREATOR_NAME, CREATOR_URL } from "@/components/SiteFooter";
import { OPEN_GRAPH, SITE_NAME } from "@/lib/Site";

const TITLE = "Terms of Use";
const DESCRIPTION = `The terms for using ${SITE_NAME}: conditions are estimates for planning, not a substitute for official forecasts or your own judgement in the mountains.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: { ...OPEN_GRAPH, title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title={TITLE} updated="November 20, 2026">
      <p>
        {SITE_NAME} (openpeaks.ca) is a free site run by{" "}
        <a href={CREATOR_URL}>{CREATOR_NAME}</a>. By using it you agree to these terms.
        If you don&apos;t agree, please don&apos;t use the site.
      </p>

      <h2>For planning only, not for safety decisions</h2>
      <p>
        <strong>
          Mountain travel is dangerous. Don&apos;t rely on {SITE_NAME} to decide whether
          terrain is safe.
        </strong>{" "}
        Weather on this site comes from computer models, not on-mountain observations,
        and can be wrong, out of date or missing. The snow line is an estimate, and snow
        depths are copied from resort reports and weather stations that may lag or
        fail.
      </p>
      <p>
        Avalanche danger ratings are shown as a convenience and may be out of date or
        simplified. Before going into avalanche terrain, read the full forecast on{" "}
        <a href="https://avalanche.ca">avalanche.ca</a>, carry rescue gear, have the
        training to use it, and make your own decisions on the ground. For resort
        operations, lift status and closures, check the resort directly.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
        warranties of any kind, express or implied, including accuracy, completeness,
        fitness for a particular purpose or uninterrupted availability. Features and
        hills covered may change or be removed at any time.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {CREATOR_NAME} is not liable for any
        injury, loss or damage, direct or indirect, arising from your use of the site or
        reliance on anything shown on it. You use the information at your own risk.
      </p>

      <h2>Data sources and trademarks</h2>
      <ul>
        <li>
          Weather data by <a href="https://open-meteo.com">Open-Meteo.com</a>, licensed
          under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
        </li>
        <li>
          Avalanche danger ratings and station data from{" "}
          <a href="https://avalanche.ca">Avalanche Canada</a>.
        </li>
        <li>
          Snow reports and webcams belong to the resorts and their providers, and are
          shown or linked as they publish them.
        </li>
      </ul>
      <p>
        Resort and place names, logos and trademarks belong to their owners.{" "}
        {SITE_NAME} is independent and isn&apos;t affiliated with or endorsed by any
        resort, Avalanche Canada or Open-Meteo.
      </p>

      <h2>Using the site</h2>
      <p>
        You&apos;re welcome to use and share the site for personal, non-commercial
        purposes. Please don&apos;t scrape it at volume, overload it, try to break it or
        use it for anything unlawful. The site&apos;s design and code belong to{" "}
        {CREATOR_NAME}.
      </p>

      <h2>Privacy</h2>
      <p>
        How the site handles data is explained in the{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of British Columbia and the federal laws of
        Canada that apply there.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated from time to time; the date at the top shows the
        latest version. Continuing to use the site after a change means you accept the
        updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Get in touch through <a href={CREATOR_URL}>romanhermens.com</a>.
      </p>
    </LegalPage>
  );
}
