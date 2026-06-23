import { api } from "@/shared/api/client";

import type { AuthResponse, AuthUser } from "./model/types";

export function registerRequest(body: { email: string; password: string; name?: string }) {
  return api.post<AuthResponse>("/api/auth/register", body);
}

export function loginRequest(body: { email: string; password: string }) {
  return api.post<AuthResponse>("/api/auth/login", body);
}

export function fetchMe() {
  return api.get<AuthUser>("/api/auth/me");
}
