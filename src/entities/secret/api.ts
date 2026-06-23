import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

export type SecretMeta = {
  id: string;
  name: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
};

const secretKeys = { all: ["secrets"] as const };

export function useSecrets() {
  return useQuery({
    queryKey: secretKeys.all,
    queryFn: () => api.get<SecretMeta[]>("/api/secrets"),
  });
}

export function useCreateSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; value: Record<string, string> }) =>
      api.post<{ id: string; name: string }>("/api/secrets", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: secretKeys.all }),
  });
}

export function useDeleteSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.del<void>(`/api/secrets/${name}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: secretKeys.all }),
  });
}
