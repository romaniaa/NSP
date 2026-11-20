import Link from "next/link";
import { NAV_FORWARD } from "@/components/Transitions";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`plate border border-line bg-surface p-5 ${className}`}>
      {children}
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="section-label flex items-center gap-3 pt-4 text-lg font-semibold text-ink">
      {children}
      <span className="h-px flex-1 bg-line-2" aria-hidden="true" />
    </h2>
  );
}

export function Unavailable({ title }: { title: string }) {
  return (
    <Card>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">
        Data is unavailable right now. It will retry on the next refresh.
      </p>
    </Card>
  );
}

// The arrow on links that open another site.
export function ExternalArrow({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h7v7M13 3 3 13" />
    </svg>
  );
}

// A compact pill button that is a link. Filled for the main way out of a card
// (e.g. a resort's own page), outlined for secondary actions. External links open
// in a new tab and say so to screen readers.
export function PillLink({
  href,
  children,
  filled = false,
  className = "",
  transitionTypes = NAV_FORWARD,
}: {
  href: string;
  children: ReactNode;
  filled?: boolean;
  className?: string;
  transitionTypes?: string[];
}) {
  const external = /^https?:/.test(href);
  const cls = `orb-pill orb-pill-sm whitespace-nowrap ${className}`;
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      data-on={filled || undefined}
    >
      {children}
      <ExternalArrow />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <Link href={href} className={cls} data-on={filled || undefined} transitionTypes={transitionTypes}>
      {children}
    </Link>
  );
}
