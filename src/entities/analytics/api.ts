import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

export type FlowStat = {
  flow_id: string;
  name: string;
  total_sessions: number;
  completed: number;
  conversion_rate: number;
  messages_sent: number;
};

export type ProjectAnalytics = {
  project_id: string;
  totals: {
    flows: number;
    sessions: number;
    completed: number;
    messages_sent: number;
    conversion_rate: number;
  };
  flows: FlowStat[];
};

export type DropoffRow = { node_id: string; label: string; type: string | null; count: number };

export function useProjectAnalytics(projectId: string | undefined) {
  return useQuery({
    queryKey: ["analytics", "project", projectId ?? ""],
    queryFn: () => api.get<ProjectAnalytics>(`/api/analytics/projects/${projectId}`),
    enabled: Boolean(projectId),
  });
}

export function useFlowDropoff(flowId: string | undefined) {
  return useQuery({
    queryKey: ["analytics", "dropoff", flowId ?? ""],
    queryFn: () =>
      api.get<{ flow_id: string; dropoff: DropoffRow[] }>(`/api/analytics/flows/${flowId}/dropoff`),
    enabled: Boolean(flowId),
  });
}
