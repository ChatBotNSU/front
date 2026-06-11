import { NODE_CATALOG, NODE_GROUPS, type NodeType } from "@/entities/node/model/types";

import { DND_MIME } from "./FlowCanvas";

export function NodePalette() {
  function onDragStart(event: React.DragEvent, type: NodeType) {
    event.dataTransfer.setData(DND_MIME, type);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="scrollbar-thin flex w-60 flex-col overflow-y-auto border-r border-border bg-panel">
      <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Ноды
      </div>
      <div className="flex flex-col gap-4 p-3">
        {NODE_GROUPS.map((group) => {
          const specs = Object.values(NODE_CATALOG).filter((s) => s.group === group.id);
          return (
            <div key={group.id}>
              <div className="mb-1.5 text-[11px] uppercase tracking-wide text-muted">
                {group.label}
              </div>
              <div className="flex flex-col gap-1.5">
                {specs.map((spec) => (
                  <div
                    key={spec.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, spec.type)}
                    title={spec.description}
                    className="cursor-grab rounded-md border border-border bg-panel-2 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-accent active:cursor-grabbing"
                  >
                    {spec.label}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
