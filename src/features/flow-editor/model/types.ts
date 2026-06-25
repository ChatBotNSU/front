import type { Edge, Node } from "@xyflow/react";

import type { ExecCondition, NodeType } from "@/entities/node/model/types";

/** Data carried by each React Flow node. */
export type EditorNodeData = {
  nodeType: NodeType;
  label: string;
  config: Record<string, unknown>;
  isStart: boolean;
  /** Dataflow ports (`data_in.from_` / `data_out`). There's no canvas UI for
   * these yet, but a flow may wire them via the API — carry them through so a
   * save from the editor doesn't wipe them. */
  dataIn?: Record<string, unknown>;
  dataOut?: Record<string, string>;
};

/** A transition is either the fallback edge or a conditional branch. */
export type EditorEdgeData = {
  kind: "fallback" | "condition";
  /** Condition without `goto` (the target is the edge's target node). */
  condition?: Omit<ExecCondition, "goto">;
};

export type EditorNode = Node<EditorNodeData, "flowNode">;
export type EditorEdge = Edge<EditorEdgeData>;
