import { cn } from "@/shared/lib/cn";

import { useToastStore, type ToastType } from "./toast";

const STYLE: Record<ToastType, string> = {
  success: "border-emerald-500/40 text-emerald-200",
  error: "border-red-500/40 text-red-200",
  info: "border-border text-slate-200",
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={cn(
            "pointer-events-auto cursor-pointer rounded-md border bg-panel-2 px-4 py-2.5 text-sm shadow-xl",
            STYLE[t.type],
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
