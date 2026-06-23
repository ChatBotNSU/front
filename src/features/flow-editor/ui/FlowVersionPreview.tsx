import { Background, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { useMemo, useState } from "react";

import { useFlowVersion } from "@/entities/flow/api";
import type { FlowDetail, FlowVersionInfo } from "@/entities/flow/model/types";
import { Button, Modal, Spinner } from "@/shared/ui";

import { flowToReactFlow } from "../model/mapping";
import { FlowNode } from "./nodes/FlowNode";

import "@xyflow/react/dist/style.css";

const nodeTypes = { flowNode: FlowNode };

type Props = {
  flowId: string;
  versions: FlowVersionInfo[];
  latest?: number;
  /** Version selected on open (the pinned one, or latest). */
  initialVersion?: number;
  title?: string;
  /** Currently pinned version in a subgraph node config (undefined = latest). */
  pinnedVersion?: number;
  /** Pin the previewed version (subgraph use). undefined = "use latest". */
  onPin?: (version: number | undefined) => void;
  /** Load the previewed snapshot into the editor as the working copy. */
  onRestore?: (flow: FlowDetail) => void;
  onClose: () => void;
};

export function FlowVersionPreview({
  flowId,
  versions,
  latest,
  initialVersion,
  title = "Версии флоу",
  pinnedVersion,
  onPin,
  onRestore,
  onClose,
}: Props) {
  const [version, setVersion] = useState<number | undefined>(initialVersion ?? latest);
  const { data: flow, isLoading, isError } = useFlowVersion(flowId, version);

  const graph = useMemo(
    () => (flow ? flowToReactFlow(flow) : { nodes: [], edges: [] }),
    [flow],
  );

  const isPinned = version !== undefined && version === pinnedVersion;
  const isLatest = version !== undefined && version === latest;

  return (
    <Modal size="xl" title={title} onClose={onClose}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted">Версия</span>
        <select
          className="rounded-md border border-border bg-panel-2 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent"
          value={version === undefined ? "" : String(version)}
          onChange={(e) => setVersion(e.target.value === "" ? undefined : Number(e.target.value))}
        >
          {versions.map((v) => (
            <option key={v.version} value={String(v.version)}>
              v{v.version}
              {v.version === latest ? " · последняя" : ""}
              {v.version === pinnedVersion ? " · закреплена" : ""}
            </option>
          ))}
        </select>

        {flow && (
          <span className="text-xs text-muted">
            {flow.nodes.length} нод · {graph.edges.length} связей
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {onPin && !isPinned && (
            <Button
              variant="ghost"
              onClick={() => {
                onPin(isLatest ? undefined : version);
                onClose();
              }}
            >
              {isLatest ? "Использовать последнюю" : `Закрепить v${version}`}
            </Button>
          )}
          {isPinned && (
            <span className="rounded bg-amber-500/20 px-2 py-1 text-[11px] text-amber-300">
              закреплена сейчас
            </span>
          )}
          {onRestore && flow && !isLatest && (
            <Button
              variant="ghost"
              onClick={() => {
                onRestore(flow);
                onClose();
              }}
            >
              Восстановить v{version}
            </Button>
          )}
        </div>
      </div>

      <div className="relative h-[60vh] overflow-hidden rounded-lg border border-border bg-panel-2">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {isError && (
          <div className="flex h-full items-center justify-center text-sm text-red-400">
            Не удалось загрузить версию.
          </div>
        )}
        {flow && (
          <ReactFlowProvider>
            <ReactFlow
              key={version}
              nodes={graph.nodes}
              edges={graph.edges}
              nodeTypes={nodeTypes}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#2a2f3a" gap={20} />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </Modal>
  );
}
