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
