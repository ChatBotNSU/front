import type { ReactNode } from "react";

export const fieldInput =
  "w-full rounded-md border border-border bg-panel-2 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
