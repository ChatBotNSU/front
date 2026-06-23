export const env = {
  /** Backend base URL. Empty string → same-origin (Vite dev proxy handles /api). */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  /** Sent as the X-API-Key header. */
  apiKey: import.meta.env.VITE_API_KEY ?? "",
} as const;
