"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/useDashboard";

// Adds a hill or zone to the visitor's dashboard, or takes it off: a round button
// that fills with the place's colour and shows a check when it's on. Until the page
// hydrates it can't know the saved state, so it renders off and disabled.
export default function PinButton({
  id,
  name,
  color = "#7dd3fc",
  size = "small",
}: {
  id: string;
  name: string;
  color?: string;
  size?: "small" | "large";
}) {
  const { hydrated, has, toggle } = useDashboard();
  const on = hydrated && has(id);

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={!hydrated}
        aria-pressed={on}
        aria-label={on ? `Remove ${name} from My hills` : `Add ${name} to My hills`}
        onClick={() => toggle(id)}
        className={`orb-trigger inline-flex items-center gap-2.5 rounded-full pr-1 disabled:opacity-60 ${
          size === "large" ? "text-sm" : "text-xs"
        }`}
      >
        <span
          className={`orb ${size === "large" ? "" : "orb-sm"}`}
          data-on={on || undefined}
          style={{ "--orb": color } as CSSProperties}
          aria-hidden="true"
        >
          <svg
            data-when="off"
            className="orb-icon h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
          <svg
            data-when="on"
            className="orb-icon h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5 6.5 12 13 4.5" />
          </svg>
        </span>
        <span className={on ? "font-medium text-white" : "text-[#c9d3dd]"}>
          {on ? "On My hills" : "Add to My hills"}
        </span>
      </button>
      {on && size === "large" && (
        <Link href="/dashboard" className="text-sm text-[#9aa7b5] underline hover:text-white">
          View dashboard
        </Link>
      )}
    </span>
  );
}
