import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`plate border border-[#232a31] bg-[#13181d] p-5 ${className}`}>
      {children}
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="section-label flex items-center gap-3 pt-4 text-lg font-semibold text-[#e6edf3]">
      {children}
      <span className="h-px flex-1 bg-[#2f3840]" aria-hidden="true" />
    </h2>
  );
}

export function Unavailable({ title }: { title: string }) {
  return (
    <Card>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#9aa7b5]">
        Data is unavailable right now. It will retry on the next refresh.
      </p>
    </Card>
  );
}
