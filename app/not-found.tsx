import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { MOUNTAINS } from "@/config/mountains";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen px-4 py-8 text-ink md:px-10">
        <div className="mx-auto max-w-8xl space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">Page not found</h1>
          <p className="text-ink-2">
            There&apos;s nothing at this address. Try one of the hills:
          </p>
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link href="/" className="underline hover:text-ink">
                North Shore overview
              </Link>
            </li>
            {MOUNTAINS.map((m) => (
              <li key={m.id}>
                <Link href={`/${m.id}`} className="underline hover:text-ink">
                  {m.fullName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
