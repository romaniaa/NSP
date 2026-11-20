"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { THEME_EVENT, THEME_KEY, type Theme } from "@/lib/Theme";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

const isTheme = (v: unknown): v is Theme => v === "light" || v === "dark";

function subscribe(onChange: () => void) {
  const media = matchMedia(LIGHT_QUERY);
  // Another tab chose: follow it.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    if (isTheme(e.newValue)) document.documentElement.dataset.theme = e.newValue;
    onChange();
  };
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// The theme showing now: the visitor's choice, else their system setting.
function current(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (isTheme(chosen)) return chosen;
  return matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

function choose(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or storage full: the choice lasts for this page only.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

// An icon that turns away as the other comes in, like the orb's on/off icons.
const shown = (on: boolean, turn: number): CSSProperties =>
  on ? {} : { opacity: 0, transform: `scale(0.5) rotate(${turn}deg)` };

// Switches between light and dark, showing the theme it switches to. The theme
// isn't known on the server, so until hydration it renders disabled and blank.
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore<Theme | undefined>(subscribe, current, () => undefined);
  const next: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      disabled={!theme}
      onClick={() => choose(next)}
      aria-label={`Switch to ${next} mode`}
      title={theme ? `Switch to ${next} mode` : undefined}
      className={`orb orb-sm ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        className="orb-icon h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden="true"
        style={shown(theme === "dark", -90)}
      >
        {/* Sun */}
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06" />
      </svg>
      <svg
        viewBox="0 0 16 16"
        className="orb-icon h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        aria-hidden="true"
        style={shown(theme === "light", 90)}
      >
        {/* Moon */}
        <path d="M13.5 9.6A5.6 5.6 0 1 1 6.4 2.5a4.4 4.4 0 0 0 7.1 7.1Z" />
      </svg>
    </button>
  );
}
