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

// Known ids only, in the visitor's order, without duplicates. Anything else is
// dropped, so a hand-edited hash or stored value can't inject anything.
export function parseSelection(raw: string | null | undefined): string[] {
  const ids: string[] = [];
  for (const id of (raw ?? "").split(/[,\s]+/)) {
    if (PLACE_IDS.includes(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

// Show the given cards on the dashboard wrapper, in this order.
export function applyToDashboard(el: HTMLElement, ids: string[]) {
  el.setAttribute("data-dash", ids.join(" "));
  for (const id of PLACE_IDS) el.style.removeProperty(`--o-${id}`);
  ids.forEach((id, i) => el.style.setProperty(`--o-${id}`, String(i)));
}

// Storage can be unavailable (private windows, blocked site data), so every access
// is guarded (here and in components/useDashboard.ts) and pages work without it.
export function writeSaved(ids: string[]) {
  try {
    if (ids.length) localStorage.setItem(DASHBOARD_KEY, ids.join(","));
    else localStorage.removeItem(DASHBOARD_KEY);
  } catch {
    // Not saved; the current page still shows the selection.
  }
  window.dispatchEvent(new Event(DASHBOARD_EVENT));
}

// Runs inline before the cards are painted, doing what applyToDashboard does: picks
// the selection from the share hash or storage, records it on the wrapper as
// data-dash, and sets each card's position as a --o-<id> custom property. The CSS
// below turns those into which cards show and in what order. Without JavaScript
// nothing is set and every card shows in config order.
export const INLINE_SCRIPT = `(function(){var ok=${JSON.stringify(PLACE_IDS)},src="",ids=[];try{src=decodeURIComponent(location.hash.slice(1))}catch(e){}if(!src){try{src=localStorage.getItem(${JSON.stringify(DASHBOARD_KEY)})||""}catch(e){}}src.split(/[,\\s]+/).forEach(function(id){if(ok.indexOf(id)>=0&&ids.indexOf(id)<0)ids.push(id)});var el=document.currentScript.parentElement;el.setAttribute("data-dash",ids.join(" "));ids.forEach(function(id,i){el.style.setProperty("--o-"+id,i)})})()`;

// Show only selected cards once data-dash is set, and the empty state when it's
// set but empty. Generated per known id, so no selector comes from user input.
export const DASHBOARD_CSS = [
  "#dashboard .dash-empty{display:none}",
  '#dashboard[data-dash=""] .dash-empty{display:block}',
  "#dashboard[data-dash] [data-place]{display:none}",
  // flex, matching the wrappers' own class, so a card's controls sit below it.
  ...PLACE_IDS.map((id) => `#dashboard[data-dash~="${id}"] [data-place="${id}"]{display:flex}`),
  ...PLACE_IDS.map((id) => `#dashboard [data-place="${id}"]{order:var(--o-${id},999)}`),
  // Per-card move and remove controls appear only while editing.
  "#dashboard:not([data-editing]) .card-actions{display:none}",
].join("\n");
