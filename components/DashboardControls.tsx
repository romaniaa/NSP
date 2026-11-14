"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import {
  DASHBOARD_EVENT,
  DASHBOARD_KEY,
  parseSelection,
  writeSaved,
} from "@/lib/Dashboard";

export interface PickerGroup {
  region: string;
  places: { id: string; name: string; kind: "Resort" | "Backcountry" }[];
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange); // other tabs
  window.addEventListener("hashchange", onChange);
  window.addEventListener(DASHBOARD_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(DASHBOARD_EVENT, onChange);
  };
}

const savedSnapshot = () => {
  try {
    return localStorage.getItem(DASHBOARD_KEY) ?? "";
  } catch {
    return "";
  }
};
const hashSnapshot = () => {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return "";
  }
};

// The dashboard's picker, share link and shared-view banner. The cards themselves
// are server-rendered; this only sets which ones show (data-dash on #dashboard,
// read by the CSS in lib/Dashboard.ts).
export default function DashboardControls({ groups }: { groups: PickerGroup[] }) {
  // null on the server and during hydration, so the first render matches the HTML.
  const savedRaw = useSyncExternalStore(subscribe, savedSnapshot, () => null);
  const hashRaw = useSyncExternalStore(subscribe, hashSnapshot, () => null);
  const hydrated = savedRaw !== null;

  const saved = parseSelection(savedRaw);
  const fromHash = parseSelection(hashRaw);
  const ids = fromHash.length ? fromHash : saved;
  const shared = fromHash.length > 0 && fromHash.join() !== saved.join();

  const [openPref, setOpen] = useState<boolean | null>(null);
  const open = hydrated && (openPref ?? ids.length === 0);
  const [copied, setCopied] = useState(false);

  // Before paint, so a client-side navigation here never flashes every card.
  const key = ids.join(" ");
  useLayoutEffect(() => {
    if (hydrated) document.getElementById("dashboard")?.setAttribute("data-dash", key);
  }, [hydrated, key]);

  function save(next: string[]) {
    if (location.hash) history.replaceState(history.state, "", location.pathname);
    writeSaved(next);
    setCopied(false);
  }

  function toggle(id: string) {
    save(ids.includes(id) ? ids.filter((x) => x !== id) : parseSelection([...ids, id].join(",")));
  }

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
          <button
            type="button"
            onClick={() => save(fromHash)}
            className="border border-white/40 px-3 py-1 text-white hover:bg-white/10"
          >
            Save as my hills
          </button>
          <button
            type="button"
            onClick={() => {
              history.replaceState(history.state, "", location.pathname);
              window.dispatchEvent(new Event(DASHBOARD_EVENT));
            }}
            className="text-[#9aa7b5] underline hover:text-white"
          >
            Back to mine
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="dashboard-picker"
          onClick={() => setOpen(!open)}
          className="border border-white/40 px-3 py-1.5 text-white hover:bg-white/10"
        >
          {open ? "Done" : "Choose hills"}
        </button>
        {ids.length > 0 && (
          <button
            type="button"
            onClick={copyLink}
            className="text-[#9aa7b5] underline hover:text-white"
          >
            {copied ? "Link copied" : "Copy a link to share"}
          </button>
        )}
        <span className="text-xs text-[#7d8da1]">Saved in this browser only.</span>
      </div>

      {open && (
        <fieldset
          id="dashboard-picker"
          className="grid grid-cols-1 gap-4 border border-[#232a31] bg-[#13181d] p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
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
      )}
    </div>
  );
}
