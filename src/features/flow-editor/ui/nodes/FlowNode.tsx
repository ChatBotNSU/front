import { Handle, Position, type NodeProps } from "@xyflow/react";

import { NODE_CATALOG, type NodeGroup } from "@/entities/node/model/types";
import { cn } from "@/shared/lib/cn";

import type { EditorNode } from "../../model/types";

const GROUP_COLOR: Record<NodeGroup, string> = {
  trigger: "bg-emerald-500",
  message: "bg-sky-500",
  logic: "bg-violet-500",
  data: "bg-amber-500",
  integration: "bg-rose-500",
  flow: "bg-slate-500",
  advanced: "bg-fuchsia-500",
};

export function FlowNode({ id, data, selected }: NodeProps<EditorNode>) {
  const spec = NODE_CATALOG[data.nodeType];
  const isTrigger = spec.group === "trigger";
  const isTerminal = spec.terminal;
  // Short, copy-friendly id excerpt for cross-referencing runtime errors.
  const shortId = id.slice(0, 8);

  function copyId(e: React.MouseEvent) {
    e.stopPropagation();
    void navigator.clipboard?.writeText(id);
  }

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border bg-panel shadow-lg transition-colors",
        selected ? "border-accent" : "border-border",
      )}
    >
      {!isTrigger && (
        <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-muted" />
      )}

      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", GROUP_COLOR[spec.group])} />
        <span className="text-[11px] uppercase tracking-wide text-muted">{spec.label}</span>
        {data.isStart && (
          <span className="ml-auto rounded bg-emerald-500/20 px-1.5 text-[10px] text-emerald-300">
            старт
          </span>
        )}
      </div>

      <div className="px-3 py-2 text-sm font-medium text-slate-100">
        {data.label || spec.label}
      </div>

      <button
        type="button"
        onClick={copyId}
        className="block w-full select-none border-t border-border/60 px-3 py-1 text-left font-mono text-[10px] text-muted/80 hover:text-slate-200"
        title={`Node id (клик — скопировать): ${id}`}
      >
        {shortId}…
      </button>

      {!isTerminal && (
        <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-accent" />
      )}
    </div>
  );
}
