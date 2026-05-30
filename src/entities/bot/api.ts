import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

export type Bot = {
  id: string;
  name: string;
  flow_id: string;
  channel: string;
  token: string;
  webhook_url: string;
  project_id: string;
};

export type BotCreate = {
  name: string;
  flow_id: string;
  channel: string;
  token?: string;
  webhook_secret?: string;
  project_id?: string;
};

export const botKeys = {
  all: ["bots"] as const,
  list: (projectId?: string) => ["bots", "list", projectId ?? null] as const,
};

export function useBots(projectId?: string) {
  return useQuery({
    queryKey: botKeys.list(projectId),
    queryFn: () => api.get<Bot[]>("/api/bots", { project_id: projectId }),
  });
}

export function useCreateBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BotCreate) => api.post<Bot>("/api/bots", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: botKeys.all }),
  });
}

export function useDeleteBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/bots/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: botKeys.all }),
  });
}

export const CHANNELS = [
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "vk", label: "VK" },
  { value: "viber", label: "Viber" },
  { value: "generic", label: "Generic (HTTP)" },
] as const;
