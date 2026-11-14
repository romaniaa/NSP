"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import MountainIcon from "@/components/MountainIcon";
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
  const { hydrated, ids, shared, fromHash, save, toggle, dismissShared } = useDashboard();

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
        <div className="flex flex-wrap items-center gap-3 border border-[#3a4550] bg-[#13181d] px-4 py-3 text-sm">
          <span className="text-[#c9d3dd]">You&apos;re viewing a shared dashboard.</span>
          <button type="button" onClick={() => save(fromHash)} className="orb-pill">
            Save as my hills
          </button>
          <button
            type="button"
            onClick={dismissShared}
            className="text-[#9aa7b5] underline hover:text-white"
          >
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
          className="orb-pill"
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
          {editing ? "Done" : "Edit dashboard"}
        </button>
        {ids.length > 0 && !editing && (
          <button
            type="button"
            onClick={copyLink}
            className="text-[#9aa7b5] underline hover:text-white"
          >
            {copied ? "Link copied" : "Copy a link to share"}
          </button>
        )}
        {editing && ids.length > 1 && (
          <button
            type="button"
            onClick={() => save([])}
            className="text-[#9aa7b5] underline hover:text-white"
          >
            Clear all
          </button>
        )}
        <span className="text-xs text-[#7d8da1]">
          {hydrated && `${ids.length} picked · `}Saved in this browser only.
        </span>
      </div>

      {editing && (
        <div
          id="dashboard-picker"
          className="space-y-3 border border-[#232a31] bg-[#13181d] p-4"
        >
          <p className="text-sm text-[#c9d3dd]">
            Tick what you want on your dashboard, then use the controls under each
            card to reorder or remove it. You can also add hills from{" "}
            <Link href="/hills" className="underline hover:text-white">
              All hills
            </Link>{" "}
            or any hill&apos;s page.
          </p>
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <legend className="sr-only">Hills and backcountry zones to show</legend>
            {groups.map((g) => (
              <div key={g.region}>
                <p className="text-xs uppercase tracking-widest text-[#9aa7b5]">{g.region}</p>
                <ul className="mt-2 space-y-1.5">
                  {g.places.map((p) => (
                    <li key={p.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={ids.includes(p.id)}
                          onChange={() => toggle(p.id)}
                          className="h-4 w-4 accent-white"
                        />
                        {p.kind === "Backcountry" ? (
                          <RangeIcon color={p.color} className="h-3 w-4" />
                        ) : (
                          <MountainIcon id={p.id as MountainId} color={p.color} className="h-3 w-4" />
                        )}
                        {p.name}
                        {p.kind === "Backcountry" && (
                          <span className="text-xs text-[#9aa7b5]">backcountry</span>
                        )}
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
