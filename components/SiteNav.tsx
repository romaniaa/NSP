"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MountainIcon from "@/components/MountainIcon";
import { MOUNTAINS } from "@/config/mountains";

export default function SiteNav() {
  const pathname = usePathname();
  const active =
    MOUNTAINS.find((m) => pathname === `/${m.id}`)?.id ??
    (pathname === "/" ? "home" : null);

  const items = [
    { id: "home" as const, href: "/", label: "Overview", color: "#e6edf3" },
    ...MOUNTAINS.map((m) => ({
      id: m.id,
      href: `/${m.id}`,
      label: m.name,
      color: m.color,
    })),
  ];

  return (
    <nav aria-label="Main" className="border-b border-[#2f3840] bg-[#0a0d10]/70 px-4 md:px-10">
      <div className="mx-auto flex max-w-8xl items-center gap-1 overflow-x-auto">
        <span className="mr-4 whitespace-nowrap py-3 font-display text-lg font-bold uppercase tracking-widest text-white">
          North Shore Peaks
        </span>
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm ${
                isActive
                  ? "text-white"
                  : "border-transparent text-[#9aa7b5] hover:text-white"
              }`}
              style={isActive ? { borderBottomColor: item.color } : undefined}
            >
              {item.id !== "home" && (
                <MountainIcon id={item.id} color={item.color} className="h-3 w-4" />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}