import type { ReactNode } from "react";

export const authInput =
  "rounded-md border border-border bg-panel-2 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent";

export function AuthCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-panel p-6 shadow-xl">
        <h1 className="mb-5 text-xl font-semibold">{title}</h1>
        {children}
        {footer && <p className="mt-4 text-center text-xs text-muted">{footer}</p>}
      </div>
    </div>
  );
}
