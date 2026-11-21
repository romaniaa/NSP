import type { ReactNode } from "react";
import SiteNav from "@/components/SiteNav";
import { PageTransition } from "@/components/Transitions";

// The shell for the privacy and terms pages: a narrow column of plain prose.
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <PageTransition>
        <main className="min-h-screen px-4 py-8 text-ink md:px-10">
          <article className="mx-auto max-w-3xl text-ink-2 [&_a]:underline [&_a:hover]:text-ink [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:mt-1.5 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
            <header className="pb-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-ink">{title}</h1>
              <p className="text-sm text-faint">Last updated {updated}</p>
            </header>
            {children}
          </article>
        </main>
      </PageTransition>
    </>
  );
}
