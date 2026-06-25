import type { ExecCondition, FlowNodeModel } from "@/entities/node/model/types";
import { CONDITION_OPERATORS, OPERATOR_SYMBOLS, VALUELESS_OPERATORS } from "@/entities/node/model/types";
import type { FlowDetail, FlowWritePayload } from "@/entities/flow/model/types";

import type { EditorEdge, EditorNode } from "./types";

/** Short human label for a condition edge, e.g. `text ≥ 100`. */
export function conditionLabel(cond?: Omit<ExecCondition, "goto">): string {
  if (!cond) return "fallback";
  const field = cond.if?.replace(/^\$data\./, "") || "?";
  for (const op of CONDITION_OPERATORS) {
    const value = cond[op];
    if (value !== undefined && value !== null) {
      const symbol = OPERATOR_SYMBOLS[op];
      if (VALUELESS_OPERATORS.has(op)) return `${field} ${symbol}`;
      return `${field} ${symbol} ${JSON.stringify(value)}`;
    }
  }
  return field;
}

// ─── Flow (backend) → React Flow ──────────────────────────────────────────────

export function flowToReactFlow(flow: FlowDetail): {
  nodes: EditorNode[];
  edges: EditorEdge[];
} {
  const nodes: EditorNode[] = flow.nodes.map((n) => ({
    id: n.id,
    type: "flowNode",
    position: n.position ?? { x: 0, y: 0 },
    data: {
      nodeType: n.type,
      label: n.label,
      config: n.config ?? {},
      isStart: n.id === flow.start_node,
      dataIn: n.data_in ?? {},
      dataOut: n.data_out ?? {},
    },
  }));

  const edges: EditorEdge[] = [];
  for (const n of flow.nodes) {
    const exec = n.exec_out ?? { conditions: [], fallback: null };
    exec.conditions?.forEach((cond, i) => {
      const { goto, ...rest } = cond;
      if (!goto) return;
      edges.push({
        id: `${n.id}:c${i}`,
        source: n.id,
        target: goto,
        label: conditionLabel(rest),
        data: { kind: "condition", condition: rest },
      });
    });
    if (exec.fallback) {
      edges.push({
        id: `${n.id}:fallback`,
        source: n.id,
        target: exec.fallback,
        // No label: a fallback edge has no condition, so nothing to show.
        data: { kind: "fallback" },
      });
    }
  }

  return { nodes, edges };
}

// ─── React Flow → Flow write payload ──────────────────────────────────────────

export function reactFlowToPayload(
  nodes: EditorNode[],
  edges: EditorEdge[],
  meta: {
    name: string;
    startNode: string | null;
    projectId?: string;
    metadata?: Record<string, unknown>;
  },
): FlowWritePayload {
  const outgoing = new Map<string, EditorEdge[]>();
  for (const e of edges) {
    const list = outgoing.get(e.source) ?? [];
    list.push(e);
    outgoing.set(e.source, list);
  }

  const modelNodes: FlowNodeModel[] = nodes.map((n) => {
    const conditions: ExecCondition[] = [];
    let fallback: string | null = null;

    for (const e of outgoing.get(n.id) ?? []) {
      if (e.data?.kind === "fallback") {
        fallback = e.target;
      } else {
        conditions.push({ ...(e.data?.condition ?? { if: "" }), goto: e.target });
      }
    }

    return {
      id: n.id,
      type: n.data.nodeType,
      label: n.data.label,
      data_in: n.data.dataIn ?? {},
      data_out: n.data.dataOut ?? {},
      config: n.data.config,
      exec_out: { conditions, fallback },
      position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
    };
  });

  return {
    name: meta.name,
    project_id: meta.projectId,
    nodes: modelNodes,
    start_node: meta.startNode,
    metadata: meta.metadata,
  };
}
