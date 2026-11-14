"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MountainIcon from "@/components/MountainIcon";
import { NAV_BACK, NAV_FORWARD } from "@/components/Transitions";
import { MOUNTAINS, type MountainId } from "@/config/mountains";

// The North Shore hills get their own tabs; every other hill is reached
// through "All hills", which stays highlighted on those hills' pages.
const TABS = MOUNTAINS.filter((m) => m.region === "north-shore");

type ItemId = "home" | "hills" | MountainId;

export default function SiteNav() {
  const pathname = usePathname();
  const hill = MOUNTAINS.find((m) => pathname === `/${m.id}`);
  const active: ItemId | null =
    pathname === "/"
      ? "home"
      : pathname === "/hills"
        ? "hills"
        : hill
          ? TABS.some((t) => t.id === hill.id)
            ? hill.id
            : "hills"
          : null;

  const items: { id: ItemId; href: string; label: string; color: string; icon?: MountainId }[] = [
    { id: "home", href: "/", label: "Overview", color: "#e6edf3" },
    ...TABS.map((m) => ({
      id: m.id,
      href: `/${m.id}`,
      label: m.name,
      color: m.color,
      icon: m.id,
    })),
    { id: "hills", href: "/hills", label: "All hills", color: "#e6edf3" },
  ];

  return (
    // Named so it stays put while the page content slides beneath it.
    <nav
      aria-label="Main"
      style={{ viewTransitionName: "site-nav" }}
      className="border-b border-[#2f3840] bg-[#0a0d10]/70 px-4 md:px-10">
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
              transitionTypes={
                item.id === "home"
                  ? NAV_BACK
                  : active === "home"
                    ? NAV_FORWARD
                    : undefined
              }
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm ${
                isActive
                  ? "text-white"
                  : "border-transparent text-[#9aa7b5] hover:text-white"
              }`}
              style={isActive ? { borderBottomColor: item.color } : undefined}
            >
              {item.icon && (
                <MountainIcon id={item.icon} color={item.color} className="h-3 w-4" />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
