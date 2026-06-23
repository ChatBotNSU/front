const KEY = "auth_token";

let cached: string | null | undefined;

export function getToken(): string | null {
  if (cached === undefined) cached = localStorage.getItem(KEY);
  return cached;
}

export function setToken(token: string): void {
  cached = token;
  localStorage.setItem(KEY, token);
}

export function clearToken(): void {
  cached = null;
  localStorage.removeItem(KEY);
}
