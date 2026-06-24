import type { FlowNodeModel } from "@/entities/node/model/types";

export type FlowSummary = {
  id: string;
  name: string;
  description: string;
  project_id: string;
  node_count: number;
  start_node: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

/** A single declared input or output of a flow's public interface. The runtime
 *  uses the names to build the variable scope of an isolated subflow call. */
export type FlowVarDecl = {
  name: string;
  description?: string;
};

export type FlowInterface = {
  inputs: FlowVarDecl[];
  outputs: FlowVarDecl[];
};

export type FlowDetail = FlowSummary & {
  nodes: FlowNodeModel[];
  metadata: Record<string, unknown>;
};

/** Payload for POST/PUT /api/flows (nodes use the same shape as the model). */
export type FlowWritePayload = {
  name: string;
  description?: string;
  project_id?: string;
  nodes: FlowNodeModel[];
  start_node?: string | null;
  metadata?: Record<string, unknown>;
};

/** Helper: read declared inputs/outputs out of an arbitrary flow metadata blob.
 *  Tolerant of missing / wrong-shaped values so legacy flows don't crash the UI. */
export function readFlowInterface(meta: Record<string, unknown> | undefined): FlowInterface {
  const inputs = Array.isArray(meta?.inputs) ? (meta!.inputs as unknown[]) : [];
  const outputs = Array.isArray(meta?.outputs) ? (meta!.outputs as unknown[]) : [];
  const norm = (list: unknown[]): FlowVarDecl[] =>
    list
      .map((item) => {
        if (item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string") {
          const name = (item as { name: string }).name.trim();
          if (!name) return null;
          const description = (item as { description?: unknown }).description;
          return { name, description: typeof description === "string" ? description : undefined };
        }
        return null;
      })
      .filter((x): x is FlowVarDecl => x !== null);
  return { inputs: norm(inputs), outputs: norm(outputs) };
}

export type FlowValidationResult = {
  valid: boolean;
  errors: string[];
};

export type FlowVersionInfo = {
  version: number;
  created_at: string;
};

export type FlowVersionsResponse = {
  latest: number;
  versions: FlowVersionInfo[];
  /** Working draft has changes not captured in the latest version. */
  draft_dirty: boolean;
};

export type BotMessage = {
  content_type?: string;
  text?: string;
  buttons?: { label?: string; text?: string; value?: string }[];
  [key: string]: unknown;
};

export type FlowRunResponse = {
  session_id: string;
  state: string;
  waiting: boolean;
  current_node: string | null;
  messages: BotMessage[];
  slot_question: string | null;
  error: string | null;
};
