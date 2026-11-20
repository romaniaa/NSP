"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import MountainIcon from "@/components/MountainIcon";
import RangeIcon from "@/components/RangeIcon";
import ThemeToggle from "@/components/ThemeToggle";
import { NAV_BACK, NAV_FADE, NAV_FORWARD } from "@/components/Transitions";
import { useDashboard } from "@/components/useDashboard";
import { MOUNTAINS, type MountainId } from "@/config/mountains";
import { REGIONS, type RegionId } from "@/config/regions";
import { ZONES } from "@/config/zones";
import { DANGER_STYLE } from "@/lib/DangerStyle";
import type { NavStatus } from "@/lib/Places";

// Tabs: My hills (the home page), one per region, and Backcountry. A hill's page
// highlights its region; a zone's page highlights Backcountry.
type ItemId = "mine" | "backcountry" | RegionId;

interface Place {
  id: string;
  href: string;
  name: string;
  color: string;
  icon?: MountainId; // hills have their silhouette; zones the generic range
  backcountry: boolean;
  region: RegionId;
}

const PLACES: Place[] = [
  ...MOUNTAINS.map((m) => ({
    id: m.id,
    href: `/${m.id}`,
    name: m.fullName,
    color: m.color,
    icon: m.id,
    backcountry: false,
    region: m.region,
  })),
  ...ZONES.map((z) => ({
    id: z.id,
    href: `/backcountry/${z.id}`,
    name: z.fullName,
    color: z.color,
    backcountry: true,
    region: z.region,
  })),
];

// The drawer lists each region's hills, then its backcountry zones.
const GROUPS = REGIONS.map((r) => ({
  region: r,
  places: PLACES.filter((p) => p.region === r.id),
}));

const isRegion = (id: ItemId | null) => REGIONS.some((r) => r.id === id);

function activeItem(pathname: string): ItemId | null {
  if (pathname === "/") return "mine";
  if (pathname === "/backcountry" || pathname.startsWith("/backcountry/")) return "backcountry";
  const region = REGIONS.find((r) => pathname === `/${r.id}`);
  if (region) return region.id;
  return MOUNTAINS.find((m) => pathname === `/${m.id}`)?.region ?? null;
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
        transitionTypes={NAV_FORWARD}
        onClick={onNavigate}
        aria-current={current ? "page" : undefined}
        className={`flex items-center gap-3 border-l-2 px-3 py-2.5 ${
          current ? "bg-ink/[0.06]" : "border-transparent hover:bg-ink/[0.04]"
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
          <span className="block truncate text-[15px] font-medium text-ink">{place.name}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
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
            <span className="block font-mono text-sm text-ink">
              {status.freezingLevel.toLocaleString("en-CA")}
              <span className="text-[10px] text-muted"> m</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-faint">
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
  // My hills' count is unknown on the server, so it appears after hydration.
  const { hydrated, saved } = useDashboard();

  const drawer = useRef<HTMLDialogElement>(null);
  // Next keeps recently visited pages mounted but hidden for instant back and
  // forward, so several navs can be in the document at once: ids must be unique.
  const drawerId = useId();
  const close = () => drawer.current?.close();

  // Close on navigation, including browser back and forward.
  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);

  const items: { id: ItemId; href: string; label: string; count?: number }[] = [
    { id: "mine", href: "/", label: "My hills", count: hydrated ? saved.length : undefined },
    ...REGIONS.map((r) => ({ id: r.id, href: `/${r.id}`, label: r.name })),
    { id: "backcountry", href: "/backcountry", label: "Backcountry" },
  ];
  // Region to region is a sideways move; My hills is home.
  const transitionTo = (id: ItemId) =>
    id === "mine" ? NAV_BACK : isRegion(id) && isRegion(active) ? NAV_FADE : NAV_FORWARD;

  const savedPlaces = saved
    .map((id) => PLACES.find((p) => p.id === id))
    .filter((p): p is Place => p != null);

  const quick = "orb-pill orb-pill-sm justify-center text-center";

  return (
    // Named so it stays put while the page content slides beneath it.
    <nav
      aria-label="Main"
      style={{ viewTransitionName: "site-nav" }}
      className="border-b border-line-2 bg-page/70 px-4 md:px-10"
    >
      {/* Phones: the brand up top, and the controls in a bar floating at the
          bottom centre, within reach of a thumb. */}
      <div className="py-3 md:hidden">
        <Link
          href="/"
          transitionTypes={NAV_BACK}
          className="whitespace-nowrap font-display text-lg font-bold uppercase tracking-widest text-ink"
        >
          OpenPeaks
        </Link>
      </div>
      <div
        // Named so it stays put, like the nav, while the page changes beneath it.
        style={{ viewTransitionName: "mobile-nav" }}
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:hidden"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-edge bg-raised/85 p-1.5 shadow-lg shadow-black/25 backdrop-blur-md">
          <Link
            href="/"
            transitionTypes={NAV_BACK}
            aria-current={active === "mine" ? "page" : undefined}
            data-on={active === "mine" || undefined}
            className="orb-pill min-h-11 border-transparent bg-transparent px-4"
          >
            My hills
            {hydrated && saved.length ? (
              <span className="orb-badge" aria-label={`${saved.length} saved`}>
                {saved.length}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls={drawerId}
            onClick={() => drawer.current?.showModal()}
            aria-label="All hills: every hill and zone, with live conditions"
            className="orb-pill min-h-11 border-transparent bg-transparent px-4"
          >
            <svg viewBox="0 0 16 12" className="h-3 w-4" aria-hidden="true" fill="currentColor">
              <rect width="16" height="2" rx="1" />
              <rect y="5" width="16" height="2" rx="1" />
              <rect y="10" width="16" height="2" rx="1" />
            </svg>
            All hills
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Larger screens: the tab row. */}
      <div className="mx-auto hidden max-w-8xl items-center gap-1 overflow-x-auto md:flex">
        <Link
          href="/"
          transitionTypes={NAV_BACK}
          className="mr-4 whitespace-nowrap py-3 font-display text-lg font-bold uppercase tracking-widest text-ink"
        >
          OpenPeaks
        </Link>
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <Link
              key={item.id}
              href={item.href}
              transitionTypes={transitionTo(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm ${
                isActive ? "text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
              style={isActive ? { borderBottomColor: "var(--ink)" } : undefined}
            >
              {item.label}
              {item.count ? (
                <span className="orb-badge" aria-label={`${item.count} saved`}>
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
        <ThemeToggle className="ml-auto" />
      </div>

      {/* A modal dialog, rising from the bottom bar as a sheet: it traps focus,
          closes on Escape, makes the page behind inert, and returns focus to the
          menu button when it closes. Tapping the backdrop (the dialog element
          itself, outside the panel) closes it too. */}
      <dialog
        id={drawerId}
        data-nav-drawer
        ref={drawer}
        aria-label="Site menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-0 h-[88dvh] max-h-none w-full max-w-none rounded-t-2xl border-0 border-t border-line-2 bg-sunken p-0 pb-[env(safe-area-inset-bottom)] text-ink shadow-2xl transition-[translate,display,overlay] transition-discrete duration-300 ease-out not-open:translate-y-full starting:open:translate-y-full backdrop:bg-black/50 motion-reduce:transition-none"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line-2 px-4 py-3">
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-widest">
                OpenPeaks
              </p>
              <p className="text-xs text-faint">
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
                href="/backcountry"
                transitionTypes={NAV_FORWARD}
                onClick={close}
                aria-current={pathname === "/backcountry" ? "page" : undefined}
                className={quick}
              >
                Backcountry
              </Link>
              <Link
                href="/hills"
                transitionTypes={NAV_FORWARD}
                onClick={close}
                aria-current={pathname === "/hills" ? "page" : undefined}
                className={quick}
              >
                All hills
              </Link>
            </div>

            <section aria-labelledby="drawer-mine" className="px-1">
              <div className="flex items-baseline justify-between px-3 pb-1">
                <h2 id="drawer-mine" className="text-sm text-muted">
                  My hills
                </h2>
                <Link
                  href="/"
                  transitionTypes={NAV_BACK}
                  onClick={close}
                  aria-current={active === "mine" ? "page" : undefined}
                  className="orb-pill orb-pill-sm"
                >
                  {savedPlaces.length ? "Open" : "Pick some"}
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
                <p className="mx-3 border border-dashed border-line-2 px-3 py-3 text-sm text-muted">
                  Pin the hills you ski with{" "}
                  <span className="text-ink">+ Add to My hills</span> and they&apos;ll be
                  here.
                </p>
              )}
            </section>

            {GROUPS.map((g) => (
              <section key={g.region.id} aria-label={g.region.name} className="mt-4 px-1">
                <div className="flex items-baseline justify-between px-3 pb-1">
                  <h2 className="text-sm text-muted">{g.region.name}</h2>
                  <Link
                    href={`/${g.region.id}`}
                    transitionTypes={NAV_FORWARD}
                    onClick={close}
                    aria-current={pathname === `/${g.region.id}` ? "page" : undefined}
                    className="orb-pill orb-pill-sm"
                  >
                    Region page
                  </Link>
                </div>
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

            <p className="mt-6 px-4 text-xs text-faint">
              Freezing level and rain or snow are model estimates. Avalanche danger
              from Avalanche Canada: read the full forecast before heading out.
            </p>
          </div>
        </div>
      </dialog>
    </nav>
  );
}
