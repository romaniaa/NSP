"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import MountainIcon from "@/components/MountainIcon";
import RangeIcon from "@/components/RangeIcon";
import { NAV_BACK, NAV_FORWARD } from "@/components/Transitions";
import { useDashboard } from "@/components/useDashboard";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import { REGIONS } from "@/config/regions";
import { ZONES } from "@/config/zones";
import { DANGER_STYLE } from "@/lib/DangerStyle";
import type { NavStatus } from "@/lib/Places";

// The North Shore hills get their own tabs; every other hill and the backcountry
// zones are reached through "More hills", which stays highlighted on their pages.
// "My hills" sits next to Overview once a dashboard is saved.
const TABS = MOUNTAINS.filter((m) => m.region === "north-shore");

type ItemId = "home" | "hills" | "dashboard" | MountainId;

interface Place {
  id: string;
  href: string;
  name: string;
  color: string;
  icon?: MountainId; // hills have their silhouette; zones the generic range
  backcountry: boolean;
}

const PLACES: Place[] = [
  ...MOUNTAINS.map((m) => ({
    id: m.id,
    href: `/${m.id}`,
    name: m.fullName,
    color: m.color,
    icon: m.id,
    backcountry: false,
  })),
  ...ZONES.map((z) => ({
    id: z.id,
    href: `/backcountry/${z.id}`,
    name: z.fullName,
    color: z.color,
    backcountry: true,
  })),
];

const GROUPS = REGIONS.map((r) => ({
  region: r.name,
  places: PLACES.filter(
    (p) =>
      (MOUNTAINS.find((m) => m.id === p.id) ?? ZONES.find((z) => z.id === p.id))?.region === r.id
  ),
})).filter((g) => g.places.length > 0);

function activeItem(pathname: string): ItemId | null {
  if (pathname === "/") return "home";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/hills" || pathname.startsWith("/backcountry/")) return "hills";
  const hill = MOUNTAINS.find((m) => pathname === `/${m.id}`);
  if (!hill) return null;
  return TABS.some((t) => t.id === hill.id) ? hill.id : "hills";
}

// One hill or zone in the drawer: name, live status and freezing level.
function PlaceRow({
  place,
  status,
  current,
  onNavigate,
}: {
  place: Place;
  status: NavStatus["places"][string] | undefined;
  current: boolean;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={place.href}
        onClick={onNavigate}
        aria-current={current ? "page" : undefined}
        className={`flex items-center gap-3 border-l-2 px-3 py-2.5 ${
          current ? "bg-white/[0.06]" : "border-transparent hover:bg-white/[0.04]"
        }`}
        style={current ? { borderLeftColor: place.color } : undefined}
      >
        <span className="flex w-5 shrink-0 justify-center" aria-hidden="true">
          {place.icon ? (
            <MountainIcon id={place.icon} color={place.color} className="h-3.5 w-5" />
          ) : (
            <RangeIcon color={place.color} className="h-3.5 w-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-white">{place.name}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-[#9aa7b5]">
            {status?.danger && (
              <span
                className={`h-2 w-2 shrink-0 ${DANGER_STYLE[status.danger].chip}`}
                aria-hidden="true"
              />
            )}
            <span className="truncate">
              {place.backcountry ? "Backcountry · " : ""}
              {status?.status ?? "Status unavailable"}
            </span>
          </span>
        </span>
        {status?.freezingLevel != null && (
          <span className="shrink-0 text-right">
            <span className="block font-mono text-sm text-white">
              {status.freezingLevel.toLocaleString("en-CA")}
              <span className="text-[10px] text-[#8f8f8f]"> m</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-[#7d8da1]">
              Freezing
            </span>
          </span>
        )}
      </Link>
    </li>
  );
}

export default function NavClient({ status }: { status: NavStatus | null }) {
  const pathname = usePathname();
  const active = activeItem(pathname);
  // "My hills" shows once a dashboard is saved in this browser, with its count.
  // Unknown on the server, so it appears after hydration.
  const { saved } = useDashboard();

  const drawer = useRef<HTMLDialogElement>(null);
  // Next keeps recently visited pages mounted but hidden for instant back and
  // forward, so several navs can be in the document at once: ids must be unique.
  const drawerId = useId();
  const close = () => drawer.current?.close();

  // Close on navigation, including browser back and forward.
  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);

  const items: {
    id: ItemId;
    href: string;
    label: string;
    color: string;
    icon?: MountainId;
    count?: number;
  }[] = [
    { id: "home", href: "/", label: "Overview", color: "#e6edf3" },
    ...(saved.length > 0 || active === "dashboard"
      ? [
          {
            id: "dashboard" as const,
            href: "/dashboard",
            label: "My hills",
            count: saved.length,
            color: "#e6edf3",
          },
        ]
      : []),
    ...TABS.map((m) => ({
      id: m.id,
      href: `/${m.id}`,
      label: m.name,
      color: m.color,
      icon: m.id,
    })),
    { id: "hills", href: "/hills", label: "More hills & backcountry", color: "#e6edf3" },
  ];

  const savedPlaces = saved
    .map((id) => PLACES.find((p) => p.id === id))
    .filter((p): p is Place => p != null);

  const quick = "orb-pill orb-pill-sm justify-center text-center";

  return (
    // Named so it stays put while the page content slides beneath it.
    <nav
      aria-label="Main"
      style={{ viewTransitionName: "site-nav" }}
      className="border-b border-[#2f3840] bg-[#0a0d10]/70 px-4 md:px-10"
    >
      {/* Phones: brand, a shortcut to the dashboard, and the menu. */}
      <div className="flex items-center gap-2 py-2 md:hidden">
        <Link
          href="/"
          className="mr-auto whitespace-nowrap py-1 font-display text-lg font-bold uppercase tracking-widest text-white"
        >
          North Shore Peaks
        </Link>
        {saved.length > 0 && active !== "dashboard" && (
          <Link href="/dashboard" className="orb-pill min-h-[30px] !px-3.5 whitespace-nowrap">
            My hills
            <span className="orb-badge" aria-label={`${saved.length} saved`}>
              {saved.length}
            </span>
          </Link>
        )}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls={drawerId}
          onClick={() => drawer.current?.showModal()}
          aria-label="Menu: every hill and zone, with live conditions"
          className="orb"
        >
          <svg viewBox="0 0 16 12" className="h-3 w-4" aria-hidden="true" fill="currentColor">
            <rect width="16" height="2" rx="1" />
            <rect y="5" width="16" height="2" rx="1" />
            <rect y="10" width="16" height="2" rx="1" />
          </svg>
        </button>
      </div>

      {/* Larger screens: the tab row. */}
      <div className="mx-auto hidden max-w-8xl items-center gap-1 overflow-x-auto md:flex">
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
                item.id === "home" ? NAV_BACK : active === "home" ? NAV_FORWARD : undefined
              }
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm ${
                isActive ? "text-white" : "border-transparent text-[#9aa7b5] hover:text-white"
              }`}
              style={isActive ? { borderBottomColor: item.color } : undefined}
            >
              {item.icon && <MountainIcon id={item.icon} color={item.color} className="h-3 w-4" />}
              {item.label}
              {item.count ? (
                <span className="orb-badge" aria-label={`${item.count} saved`}>
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* A modal dialog: it traps focus, closes on Escape, makes the page behind
          inert, and returns focus to the menu button when it closes. Tapping the
          backdrop (the dialog element itself, outside the panel) closes it too. */}
      <dialog
        id={drawerId}
        data-nav-drawer
        ref={drawer}
        aria-label="Site menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(90vw,400px)] max-w-none border-0 border-l border-[#2f3840] bg-[#0d1115] p-0 text-white transition-[translate,display,overlay] transition-discrete duration-200 ease-out not-open:translate-x-full starting:open:translate-x-full backdrop:bg-black/70 motion-reduce:transition-none"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-[#2f3840] px-4 py-3">
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-widest">
                North Shore Peaks
              </p>
              <p className="text-xs text-[#7d8da1]">
                {status?.asOf
                  ? `Conditions as of ${status.asOf} · updated hourly`
                  : "Live conditions unavailable right now"}
              </p>
            </div>
            <button type="button" onClick={close} aria-label="Close menu" className="orb orb-sm">
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="m4 4 8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain pb-6">
            <div className="grid grid-cols-2 gap-2 px-4 py-4">
              <Link
                href="/"
                onClick={close}
                aria-current={active === "home" ? "page" : undefined}
                className={quick}
              >
                Overview
              </Link>
              <Link
                href="/hills"
                onClick={close}
                aria-current={pathname === "/hills" ? "page" : undefined}
                className={quick}
              >
                More hills
              </Link>
            </div>

            <section aria-labelledby="drawer-mine" className="px-1">
              <div className="flex items-baseline justify-between px-3 pb-1">
                <h2 id="drawer-mine" className="text-sm text-[#9aa7b5]">
                  My hills
                </h2>
                <Link href="/dashboard" onClick={close} className="orb-pill orb-pill-sm">
                  {savedPlaces.length ? "Open dashboard" : "Build one"}
                </Link>
              </div>
              {savedPlaces.length ? (
                <ul>
                  {savedPlaces.map((p) => (
                    <PlaceRow
                      key={p.id}
                      place={p}
                      status={status?.places[p.id]}
                      current={pathname === p.href}
                      onNavigate={close}
                    />
                  ))}
                </ul>
              ) : (
                <p className="mx-3 border border-dashed border-[#2f3840] px-3 py-3 text-sm text-[#9aa7b5]">
                  Pin the hills you ski with{" "}
                  <span className="text-white">+ Add to My hills</span> and they&apos;ll be
                  here.
                </p>
              )}
            </section>

            {GROUPS.map((g) => (
              <section key={g.region} aria-label={g.region} className="mt-4 px-1">
                <h2 className="px-3 pb-1 text-sm text-[#9aa7b5]">{g.region}</h2>
                <ul>
                  {g.places.map((p) => (
                    <PlaceRow
                      key={p.id}
                      place={p}
                      status={status?.places[p.id]}
                      current={pathname === p.href}
                      onNavigate={close}
                    />
                  ))}
                </ul>
              </section>
            ))}

            <p className="mt-6 px-4 text-xs text-[#7d8da1]">
              Freezing level and rain or snow are model estimates. Avalanche danger
              from Avalanche Canada: read the full forecast before heading out.
            </p>
          </div>
        </div>
      </dialog>
    </nav>
  );
}
