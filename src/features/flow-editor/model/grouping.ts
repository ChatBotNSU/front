import { nodeSpec } from "@/entities/node/model/types";

import type { EditorEdge, EditorNode } from "./types";

export type GroupingPlan = {
  /** New nodes/edges for the extracted child flow. */
  childNodes: EditorNode[];
  childEdges: EditorEdge[];
  childStartNode: string | null;
  /** Parent graph after replacing the selection with one subgraph node. */
  parentNodes: EditorNode[];
  parentEdges: EditorEdge[];
  subgraphNodeId: string;
};

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `n_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Plan extraction of the currently-selected nodes into a child flow, replacing
 * them in the parent with a single `subgraph` node. Returns null if < 2 nodes
 * are selected (grouping a single node is pointless). `flow_id` of the new
 * subgraph node is left empty — set it once the child flow is created.
 */
export function planGrouping(nodes: EditorNode[], edges: EditorEdge[]): GroupingPlan | null {
  const selected = nodes.filter((n) => n.selected);
  if (selected.length < 2) return null;

  const selectedIds = new Set(selected.map((n) => n.id));
  const isIn = (id: string) => selectedIds.has(id);

  const childNodes: EditorNode[] = selected.map((n) => ({
    ...n,
    selected: false,
    data: { ...n.data },
  }));

  const childEdges: EditorEdge[] = [];
  const inbound: EditorEdge[] = []; // from outside → into the group
  const outbound: EditorEdge[] = []; // from group → outside
  const external: EditorEdge[] = []; // unrelated to the group

  for (const e of edges) {
    const s = isIn(e.source);
    const t = isIn(e.target);
    if (s && t) childEdges.push({ ...e });
    else if (!s && t) inbound.push(e);
    else if (s && !t) outbound.push(e);
    else external.push(e);
  }

  // Entry point of the child flow: first node that outside edges point to.
  const childStartNode = inbound[0]?.target ?? selected[0].id;

  // Centroid for the new node's position.
  const cx = Math.round(selected.reduce((a, n) => a + n.position.x, 0) / selected.length);
  const cy = Math.round(selected.reduce((a, n) => a + n.position.y, 0) / selected.length);

  const subgraphNodeId = uid();
  const subgraphNode: EditorNode = {
    id: subgraphNodeId,
    type: "flowNode",
    position: { x: cx, y: cy },
    data: {
      nodeType: "subgraph",
      label: "Подграф",
      config: { ...nodeSpec("subgraph").defaultConfig },
      isStart: false,
    },
  };

  const parentNodes: EditorNode[] = [
    ...nodes.filter((n) => !isIn(n.id)).map((n) => ({ ...n, selected: false })),
    subgraphNode,
  ];

  const parentEdges: EditorEdge[] = [
    ...external.map((e) => ({ ...e })),
    ...inbound.map((e) => ({ ...e, target: subgraphNodeId })),
    ...outbound.map((e) => ({ ...e, source: subgraphNodeId })),
  ];

  return { childNodes, childEdges, childStartNode, parentNodes, parentEdges, subgraphNodeId };
}
