import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { MOUNTAINS } from "@/config/mountains";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen px-4 py-8 text-white md:px-10">
        <div className="mx-auto max-w-8xl space-y-4">
          <h1 className="text-6xl font-bold">Page not found</h1>
          <p className="text-[#c9d3dd]">
            There&apos;s nothing at this address. Try one of the hills:
          </p>
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link href="/" className="underline hover:text-white">
                North Shore overview
              </Link>
            </li>
            {MOUNTAINS.map((m) => (
              <li key={m.id}>
                <Link href={`/${m.id}`} className="underline hover:text-white">
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
