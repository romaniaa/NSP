import { MOUNTAINS } from "@/config/mountains";
import { ZONES } from "@/config/zones";

// The visitor's dashboard: which hills and zones they picked. It lives only in
// this browser's localStorage (a comma-separated list of ids), so the dashboard
// page can be static and served from the CDN: no cookie, no server work per visit.
// A share link carries a selection in the URL hash, which never reaches the server.

export const DASHBOARD_KEY = "nsp:dashboard";
// Fired on window when the saved selection changes, so the nav can update.
export const DASHBOARD_EVENT = "nsp:dashboard-change";

export const PLACE_IDS: string[] = [...MOUNTAINS.map((m) => m.id), ...ZONES.map((z) => z.id)];

// Known ids only, in config order, without duplicates. Anything else is dropped,
// so a hand-edited hash or stored value can't inject anything.
export function parseSelection(raw: string | null | undefined): string[] {
  const wanted = new Set((raw ?? "").split(/[,\s]+/));
  return PLACE_IDS.filter((id) => wanted.has(id));
}

// Storage can be unavailable (private windows, blocked site data), so every access
// is guarded and the page still works without it.
export function readSaved(): string[] {
  try {
    return parseSelection(localStorage.getItem(DASHBOARD_KEY));
  } catch {
    return [];
  }
}

export function writeSaved(ids: string[]) {
  try {
    if (ids.length) localStorage.setItem(DASHBOARD_KEY, ids.join(","));
    else localStorage.removeItem(DASHBOARD_KEY);
  } catch {
    // Not saved; the current page still shows the selection.
  }
  window.dispatchEvent(new Event(DASHBOARD_EVENT));
}

// Runs inline before the cards are painted: picks the selection from the share
// hash or storage and records it on the dashboard wrapper as data-dash, which the
// dashboard's CSS uses to show only those cards. Without JavaScript the attribute
// is never set and every card shows.
export const INLINE_SCRIPT = `(function(){var ok=${JSON.stringify(PLACE_IDS)},src="";try{src=decodeURIComponent(location.hash.slice(1))}catch(e){}if(!src){try{src=localStorage.getItem(${JSON.stringify(DASHBOARD_KEY)})||""}catch(e){}}var want=src.split(/[,\\s]+/),ids=ok.filter(function(id){return want.indexOf(id)>=0});document.currentScript.parentElement.setAttribute("data-dash",ids.join(" "))})()`;

// Show only selected cards once data-dash is set, and the empty state when it's
// set but empty. Generated per known id, so no selector comes from user input.
export const DASHBOARD_CSS = [
  "#dashboard .dash-empty{display:none}",
  '#dashboard[data-dash=""] .dash-empty{display:block}',
  "#dashboard[data-dash] [data-place]{display:none}",
  ...PLACE_IDS.map((id) => `#dashboard[data-dash~="${id}"] [data-place="${id}"]{display:block}`),
].join("\n");
