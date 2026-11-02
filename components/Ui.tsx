import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-[#1d2227] p-5 ${className}`}>
      {children}
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-1 text-xs uppercase tracking-wider text-[#7d8da1]">
      {children}
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