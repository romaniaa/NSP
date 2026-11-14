"use client";

import Link from "next/link";
import { useDashboard } from "@/components/useDashboard";

// Adds a hill or zone to the visitor's dashboard, or takes it off. Until the page
// hydrates it can't know the saved state, so it renders as "Add" and is disabled.
export default function PinButton({
  id,
  name,
  size = "small",
}: {
  id: string;
  name: string;
  size?: "small" | "large";
}) {
  const { hydrated, has, toggle } = useDashboard();
  const on = hydrated && has(id);

  const base =
    size === "large"
      ? "px-3 py-1.5 text-sm"
      : "px-2.5 py-1 text-xs";

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={!hydrated}
        aria-pressed={on}
        aria-label={on ? `Remove ${name} from My hills` : `Add ${name} to My hills`}
        onClick={() => toggle(id)}
        className={`inline-flex items-center gap-1.5 border font-medium transition disabled:opacity-60 ${base} ${
          on
            ? "border-white bg-white text-black hover:bg-white/85"
            : "border-white/40 text-white hover:bg-white/10"
        }`}
      >
        <span aria-hidden="true">{on ? "✓" : "+"}</span>
        {on ? "On My hills" : "Add to My hills"}
      </button>
      {on && size === "large" && (
        <Link href="/dashboard" className="text-sm text-[#9aa7b5] underline hover:text-white">
          View dashboard
        </Link>
      )}
    </span>
  );
}
