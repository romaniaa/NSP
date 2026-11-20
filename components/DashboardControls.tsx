"use client";

import Link from "next/link";
import { useLayoutEffect, useState, type CSSProperties } from "react";
import MountainIcon from "@/components/MountainIcon";
import { NAV_FADE } from "@/components/Transitions";
import RangeIcon from "@/components/RangeIcon";
import { useDashboard } from "@/components/useDashboard";
import type { MountainId } from "@/config/mountains";
import { applyToDashboard } from "@/lib/Dashboard";

export interface PickerGroup {
  region: string;
  places: { id: string; name: string; color: string; kind: "Resort" | "Backcountry" }[];
}

// The dashboard's toolbar: edit mode (picker plus per-card move and remove
// controls), the share link and the shared-view banner. The cards themselves are
// server-rendered; this only sets which show and in what order, through
// attributes on #dashboard that the CSS in lib/Dashboard.ts reads.
export default function DashboardControls({ groups }: { groups: PickerGroup[] }) {
  const { hydrated, chosen, ids, shared, fromHash, save, toggle, dismissShared } =
    useDashboard();

  const [editPref, setEditing] = useState<boolean | null>(null);
  // Starts in edit mode when there's nothing to show yet.
  const editing = hydrated && (editPref ?? ids.length === 0);
  const [copied, setCopied] = useState(false);

  // Before paint, so a client-side navigation here never flashes every card.
  const key = ids.join(" ");
  useLayoutEffect(() => {
    const el = document.getElementById("dashboard");
    if (!el || !hydrated) return;
    applyToDashboard(el, key ? key.split(" ") : []);
    el.toggleAttribute("data-editing", editing);
  }, [hydrated, key, editing]);

  async function copyLink() {
    const url = `${location.origin}${location.pathname}#${ids.join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="space-y-3">
      {shared && (
        <div className="flex flex-wrap items-center gap-3 border border-edge bg-surface px-4 py-3 text-sm">
          <span className="text-ink-2">You&apos;re viewing a shared dashboard.</span>
          <button
            type="button"
            onClick={() => save(fromHash)}
            className="orb-pill orb-pill-sm"
            data-on
          >
            Save as my hills
          </button>
          <button type="button" onClick={dismissShared} className="orb-pill orb-pill-sm">
            Back to mine
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          aria-expanded={editing}
          aria-controls="dashboard-picker"
          onClick={() => {
            setEditing(!editing);
            setCopied(false);
          }}
          className="orb-pill orb-pill-sm"
          data-on={editing || undefined}
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {editing ? <path d="M3 8.5 6.5 12 13 4.5" /> : <path d="M3 13h3l7-7-3-3-7 7v3Z" />}
          </svg>
          {editing ? "Done" : "Edit My hills"}
        </button>
        {ids.length > 0 && !editing && (
          <button type="button" onClick={copyLink} className="orb-pill orb-pill-sm">
            {copied ? "Link copied" : "Copy a link to share"}
          </button>
        )}
        {editing && ids.length > 1 && (
          <button type="button" onClick={() => save([])} className="orb-pill orb-pill-sm">
            Clear all
          </button>
        )}
        <span className="text-xs text-faint">
          {hydrated &&
            (chosen || shared
              ? `${ids.length} picked · Saved in this browser only.`
              : "Showing the North Shore hills until you pick your own.")}
        </span>
      </div>

      {editing && (
        <div
          id="dashboard-picker"
          className="space-y-3 border border-line bg-surface p-4"
        >
          <p className="text-sm text-ink-2">
            Tick what you want on My hills, then use the controls under each card to
            reorder or remove it. You can also add hills from{" "}
            <Link href="/hills" transitionTypes={NAV_FADE} className="underline hover:text-ink">
              All hills
            </Link>{" "}
            or any hill&apos;s page.
          </p>
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <legend className="sr-only">Hills and backcountry zones to show</legend>
            {groups.map((g) => (
              <div key={g.region}>
                <p className="text-xs uppercase tracking-widest text-muted">{g.region}</p>
                <ul className="-mx-2 mt-1">
                  {g.places.map((p) => (
                    <li key={p.id}>
                      <label
                        className="check-row text-[15px] text-ink"
                        style={{ "--orb": p.color } as CSSProperties}
                      >
                        <input
                          type="checkbox"
                          checked={ids.includes(p.id)}
                          onChange={() => toggle(p.id)}
                          className="sr-only"
                        />
                        <span className="check-box" aria-hidden="true">
                          <svg
                            viewBox="0 0 16 16"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 8.5 6.5 12 13 4.5" />
                          </svg>
                        </span>
                        {p.kind === "Backcountry" ? (
                          <RangeIcon color={p.color} className="h-3.5 w-5 shrink-0" />
                        ) : (
                          <MountainIcon
                            id={p.id as MountainId}
                            color={p.color}
                            className="h-3.5 w-5 shrink-0"
                          />
                        )}
                        <span className="min-w-0">
                          {p.name}
                          {p.kind === "Backcountry" && (
                            <span className="ml-1.5 text-xs text-muted">backcountry</span>
                          )}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </fieldset>
        </div>
      )}
    </div>
  );
}
