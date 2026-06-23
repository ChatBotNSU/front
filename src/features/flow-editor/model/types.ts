import type { Edge, Node } from "@xyflow/react";

import type { ExecCondition, NodeType } from "@/entities/node/model/types";

/** Data carried by each React Flow node. */
export type EditorNodeData = {
  nodeType: NodeType;
  label: string;
  config: Record<string, unknown>;
  isStart: boolean;
};

/** A transition is either the fallback edge or a conditional branch. */
export type EditorEdgeData = {
  kind: "fallback" | "condition";
  /** Condition without `goto` (the target is the edge's target node). */
  condition?: Omit<ExecCondition, "goto">;
};

export type EditorNode = Node<EditorNodeData, "flowNode">;
export type EditorEdge = Edge<EditorEdgeData>;
