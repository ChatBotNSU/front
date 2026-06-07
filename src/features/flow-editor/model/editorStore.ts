import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";

import { nodeSpec, type NodeType } from "@/entities/node/model/types";
import type { FlowDetail, FlowWritePayload } from "@/entities/flow/model/types";

import { conditionLabel, flowToReactFlow, reactFlowToPayload } from "./mapping";
import type { EditorEdge, EditorEdgeData, EditorNode, EditorNodeData } from "./types";

type Selection = { kind: "node" | "edge"; id: string } | null;

type EditorState = {
  flowId: string | null;
  name: string;
  projectId: string;
  startNode: string | null;
  nodes: EditorNode[];
  edges: EditorEdge[];
  selection: Selection;
  dirty: boolean;
  clipboard: { nodes: EditorNode[]; edges: EditorEdge[] } | null;

  load: (flow: FlowDetail) => void;
  setName: (name: string) => void;
  onNodesChange: (changes: NodeChange<EditorNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<EditorEdge>[]) => void;
  onConnect: (conn: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, patch: Partial<EditorNodeData>) => void;
  updateEdge: (id: string, data: EditorEdgeData) => void;
  setStartNode: (id: string) => void;
  select: (sel: Selection) => void;
  deleteSelection: () => void;
  copySelection: () => void;
  paste: () => void;
  setGraph: (nodes: EditorNode[], edges: EditorEdge[], opts?: { name?: string; startNode?: string | null }) => void;
  applyGrouping: (parentNodes: EditorNode[], parentEdges: EditorEdge[], subgraphNodeId: string, childFlowId: string) => void;
  toPayload: () => FlowWritePayload;
  markSaved: () => void;
};

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `n_${Math.random().toString(36).slice(2, 10)}`;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  flowId: null,
  name: "",
  projectId: "",
  startNode: null,
  nodes: [],
  edges: [],
  selection: null,
  dirty: false,
  clipboard: null,

  load: (flow) => {
    const { nodes, edges } = flowToReactFlow(flow);
    set({
      flowId: flow.id,
      name: flow.name,
      projectId: flow.project_id ?? "",
      startNode: flow.start_node,
      nodes,
      edges,
      selection: null,
      dirty: false,
    });
  },

  setName: (name) => set({ name, dirty: true }),

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes), dirty: true })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges), dirty: true })),

  onConnect: (conn) =>
    set((s) => {
      if (!conn.source || !conn.target) return s;
      const sourceHasFallback = s.edges.some(
        (e) => e.source === conn.source && e.data?.kind === "fallback",
      );
      const kind: EditorEdgeData["kind"] = sourceHasFallback ? "condition" : "fallback";
      const data: EditorEdgeData =
        kind === "fallback" ? { kind } : { kind, condition: { if: "" } };
      const edge: EditorEdge = {
        id: `${conn.source}->${conn.target}:${newId().slice(0, 6)}`,
        source: conn.source,
        target: conn.target,
        label: kind === "fallback" ? undefined : conditionLabel(data.condition),
        data,
      };
      return { edges: [...s.edges, edge], dirty: true };
    }),

  addNode: (type, position) =>
    set((s) => {
      const spec = nodeSpec(type);
      const node: EditorNode = {
        id: newId(),
        type: "flowNode",
        position,
        data: {
          nodeType: type,
          label: spec.label,
          config: structuredClone(spec.defaultConfig),
          isStart: s.nodes.length === 0,
        },
      };
      // First node added becomes the start node by default.
      const startNode = s.nodes.length === 0 ? node.id : s.startNode;
      return { nodes: [...s.nodes, node], startNode, dirty: true };
    }),

  updateNode: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      dirty: true,
    })),

  updateEdge: (id, data) =>
    set((s) => ({
      edges: s.edges.map((e) =>
        e.id === id
          ? {
              ...e,
              data,
              label: data.kind === "fallback" ? undefined : conditionLabel(data.condition),
            }
          : e,
      ),
      dirty: true,
    })),

  setStartNode: (id) =>
    set((s) => ({
      startNode: id,
      nodes: s.nodes.map((n) => ({ ...n, data: { ...n.data, isStart: n.id === id } })),
      dirty: true,
    })),

  select: (selection) => set({ selection }),

  deleteSelection: () =>
    set((s) => {
      if (!s.selection) return s;
      if (s.selection.kind === "edge") {
        return { edges: s.edges.filter((e) => e.id !== s.selection!.id), selection: null, dirty: true };
      }
      const id = s.selection.id;
      return {
        nodes: s.nodes.filter((n) => n.id !== id),
        edges: s.edges.filter((e) => e.source !== id && e.target !== id),
        startNode: s.startNode === id ? null : s.startNode,
        selection: null,
        dirty: true,
      };
    }),

  copySelection: () =>
    set((s) => {
      const selectedIds = new Set(s.nodes.filter((n) => n.selected).map((n) => n.id));
      if (selectedIds.size === 0) return s;
      const nodes = s.nodes.filter((n) => selectedIds.has(n.id)).map((n) => structuredClone(n));
      const edges = s.edges
        .filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
        .map((e) => structuredClone(e));
      return { clipboard: { nodes, edges } };
    }),

  paste: () =>
    set((s) => {
      if (!s.clipboard || s.clipboard.nodes.length === 0) return s;
      const idMap = new Map<string, string>();
      const pastedNodes: EditorNode[] = s.clipboard.nodes.map((n) => {
        const id = newId();
        idMap.set(n.id, id);
        return {
          ...n,
          id,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: true,
          data: { ...n.data, isStart: false },
        };
      });
      const pastedEdges: EditorEdge[] = s.clipboard.edges.map((e) => ({
        ...e,
        id: `${idMap.get(e.source)}->${idMap.get(e.target)}:${newId().slice(0, 6)}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }));
      const deselected = s.nodes.map((n) => (n.selected ? { ...n, selected: false } : n));
      return { nodes: [...deselected, ...pastedNodes], edges: [...s.edges, ...pastedEdges], dirty: true };
    }),

  setGraph: (nodes, edges, opts) =>
    set((s) => ({
      nodes,
      edges,
      name: opts?.name ?? s.name,
      startNode: opts?.startNode !== undefined ? opts.startNode : s.startNode,
      selection: null,
      dirty: true,
    })),

  applyGrouping: (parentNodes, parentEdges, subgraphNodeId, childFlowId) =>
    set({
      nodes: parentNodes.map((n) =>
        n.id === subgraphNodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, flow_id: childFlowId } } }
          : n,
      ),
      edges: parentEdges,
      selection: null,
      dirty: true,
    }),

  toPayload: () => {
    const s = get();
    return reactFlowToPayload(s.nodes, s.edges, {
      name: s.name,
      startNode: s.startNode,
      projectId: s.projectId || undefined,
    });
  },

  markSaved: () => set({ dirty: false }),
}));
