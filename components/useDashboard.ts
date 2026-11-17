"use client";

import { useSyncExternalStore } from "react";
import {
  DASHBOARD_EVENT,
  DASHBOARD_KEY,
  DEFAULT_IDS,
  parseSelection,
  writeSaved,
} from "@/lib/Dashboard";

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

// null when nothing has been stored: the visitor hasn't chosen yet.
const savedSnapshot = () => {
  try {
    return localStorage.getItem(DASHBOARD_KEY);
  } catch {
    return null;
  }
};
const hashSnapshot = () => {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return "";
  }
};

// The visitor's dashboard, shared by every control that builds it: the add
// buttons, the picker, the card controls and the nav. A share link's hash, when
// present, is what the dashboard shows until it is saved or dismissed.
export function useDashboard() {
  // undefined on the server and during hydration, so the first render matches the HTML.
  const savedRaw = useSyncExternalStore<string | null | undefined>(
    subscribe,
    savedSnapshot,
    () => undefined
  );
  const hashRaw = useSyncExternalStore(subscribe, hashSnapshot, () => null);
  const hydrated = savedRaw !== undefined;
  // The North Shore hills until the visitor stores a choice of their own.
  const chosen = savedRaw != null;

  const saved = chosen ? parseSelection(savedRaw) : DEFAULT_IDS;
  const fromHash = parseSelection(hashRaw);
  const ids = fromHash.length ? fromHash : saved; // what the dashboard shows
  const shared = fromHash.length > 0 && fromHash.join() !== saved.join();

  // Saving always drops a share hash: once edited, the dashboard is the visitor's.
  function save(next: string[]) {
    if (location.hash) history.replaceState(history.state, "", location.pathname);
    writeSaved(next);
  }

  return {
    hydrated,
    chosen,
    saved,
    ids,
    shared,
    fromHash,
    save,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => save(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]),
    remove: (id: string) => save(ids.filter((x) => x !== id)),
    // Swap with the neighbour before (-1) or after (+1).
    move: (id: string, by: -1 | 1) => {
      const i = ids.indexOf(id);
      const j = i + by;
      if (i < 0 || j < 0 || j >= ids.length) return;
      const next = [...ids];
      [next[i], next[j]] = [next[j], next[i]];
      save(next);
    },
    dismissShared: () => {
      history.replaceState(history.state, "", location.pathname);
      window.dispatchEvent(new Event(DASHBOARD_EVENT));
    },
  };
}
