import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

export type IntegrationKind = "provider" | "http" | "db";

export type Integration = {
  id: string;
  project_id: string;
  name: string;
  kind: IntegrationKind;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

const keys = {
  list: (projectId: string) => ["integrations", projectId] as const,
};

export function useIntegrations(projectId: string) {
  return useQuery({
    queryKey: keys.list(projectId),
    queryFn: () => api.get<Integration[]>(`/api/projects/${projectId}/integrations`),
    enabled: Boolean(projectId),
  });
}

export function useUpsertIntegration(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; kind: IntegrationKind; config: Record<string, unknown> }) =>
      api.post<Integration>(`/api/projects/${projectId}/integrations`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list(projectId) }),
  });
}

export function useDeleteIntegration(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      api.del<void>(`/api/projects/${projectId}/integrations/${name}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list(projectId) }),
  });
}

export const PROVIDER_OPTIONS = [
  "bitrix24",
  "amocrm",
  "hubspot",
  "salesforce",
  "google",
  "calendly",
  "stripe",
  "yookassa",
  "tinkoff",
] as const;
