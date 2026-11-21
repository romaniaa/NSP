import Link from "next/link";
import { NAV_FADE } from "@/components/Transitions";
import { ExternalArrow } from "@/components/Ui";
import { SITE_NAME } from "@/lib/Site";

export const CREATOR_NAME = "Roman Hermens";
export const CREATOR_URL = "https://romanhermens.com";

// The site-wide footer under every page: who made it and the legal pages. Each
// page keeps its own data-source credits above this.
export default function SiteFooter() {
  return (
    <footer className="relative px-4 text-xs text-faint md:px-10">
      <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line py-5">
        <p>
          {SITE_NAME} · Made by{" "}
          <a
            href={CREATOR_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-0.5 underline hover:text-ink"
          >
            {CREATOR_NAME}
            <ExternalArrow className="h-3 w-3" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
        <nav aria-label="Legal">
          <ul className="flex gap-4">
            <li>
              <Link href="/privacy" transitionTypes={NAV_FADE} className="underline hover:text-ink">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" transitionTypes={NAV_FADE} className="underline hover:text-ink">
                Terms
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
