import { ViewTransition, type ReactNode } from "react";

// Transition types set on links. "Forward" goes from the overview into a resort,
// "back" returns to the overview. Navigations without a type (browser back,
// resort to resort) skip the slide.
export const NAV_FORWARD = ["nav-forward"];
export const NAV_BACK = ["nav-back"];

const DIRECTIONAL = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
};

// Slides a page's content out and the next page's content in. It goes in each
// page.tsx, not the layout, since layouts stay mounted and never enter or exit.
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={DIRECTIONAL} exit={DIRECTIONAL} default="none">
      {children}
    </ViewTransition>
  );
}

// A block that appears on both the overview and a resort page. Blocks with the
// same name on the old and new page morph from one position into the other.
export function SharedTransition({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
