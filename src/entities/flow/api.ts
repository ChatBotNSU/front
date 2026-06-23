import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { api } from "@/shared/api/client";

import type {
  FlowDetail,
  FlowRunResponse,
  FlowSummary,
  FlowValidationResult,
  FlowVersionInfo,
  FlowVersionsResponse,
  FlowWritePayload,
} from "./model/types";

export const flowKeys = {
  all: ["flows"] as const,
  list: (projectId?: string) => ["flows", "list", projectId ?? null] as const,
  detail: (id: string) => ["flows", "detail", id] as const,
};

export function useFlows(projectId?: string) {
  return useQuery({
    queryKey: flowKeys.list(projectId),
    queryFn: () => api.get<FlowSummary[]>("/api/flows", { project_id: projectId }),
  });
}

export type FlowUsage = Record<string, { bots: number; subgraph_refs: number }>;

export function useFlowUsage(projectId?: string) {
  return useQuery({
    queryKey: ["flows", "usage", projectId ?? null],
    queryFn: () => api.get<FlowUsage>("/api/flows/usage", { project_id: projectId }),
  });
}

export function useFlow(id: string | undefined, options?: Partial<UseQueryOptions<FlowDetail>>) {
  return useQuery({
    queryKey: flowKeys.detail(id ?? ""),
    queryFn: () => api.get<FlowDetail>(`/api/flows/${id}`),
    enabled: Boolean(id),
    ...options,
  });
}

export function useFlowVersions(id: string | undefined) {
  return useQuery({
    queryKey: ["flows", "versions", id ?? null],
    queryFn: () => api.get<FlowVersionsResponse>(`/api/flows/${id}/versions`),
    enabled: Boolean(id),
  });
}

/** Full immutable snapshot of one flow version (for read-only preview). */
export function useFlowVersion(id: string | undefined, version: number | undefined) {
  return useQuery({
    queryKey: ["flows", "version", id ?? null, version ?? null],
    queryFn: () => api.get<FlowDetail>(`/api/flows/${id}/versions/${version}`),
    enabled: Boolean(id && version),
  });
}

/** Commit the current draft as a new immutable version. */
export function useCreateFlowVersion(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<FlowVersionInfo>(`/api/flows/${id}/versions`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flows", "versions", id] });
      qc.invalidateQueries({ queryKey: flowKeys.list() });
    },
  });
}

export function useCreateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FlowWritePayload) => api.post<FlowDetail>("/api/flows", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: flowKeys.all }),
  });
}

export function useUpdateFlow(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<FlowWritePayload>) =>
      api.put<FlowDetail>(`/api/flows/${id}`, payload),
    onSuccess: (data) => {
      qc.setQueryData(flowKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: flowKeys.list() });
      // Saving overwrites the draft → recompute "draft differs from version".
      qc.invalidateQueries({ queryKey: ["flows", "versions", id] });
    },
  });
}

export function useDeleteFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/flows/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: flowKeys.all }),
  });
}

export function useRenameFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.put<FlowDetail>(`/api/flows/${id}`, { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: flowKeys.all }),
  });
}

export function useGenerateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ prompt, projectId }: { prompt: string; projectId?: string }) =>
      api.post<FlowDetail>("/api/flows/generate", { prompt, project_id: projectId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: flowKeys.all }),
  });
}

export function useDuplicateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const src = await api.get<FlowDetail>(`/api/flows/${id}`);
      return api.post<FlowDetail>("/api/flows", {
        name: `${src.name} (копия)`,
        project_id: src.project_id,
        nodes: src.nodes,
        start_node: src.start_node,
        metadata: src.metadata,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: flowKeys.all }),
  });
}

export function validateFlow(id: string) {
  return api.post<FlowValidationResult>(`/api/flows/${id}/validate`);
}

export function runFlow(id: string, body: { message: string; session_id?: string | null }) {
  return api.post<FlowRunResponse>(`/api/flows/${id}/run`, body);
}
