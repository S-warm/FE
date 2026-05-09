export const SERVICE_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  useMockServices: import.meta.env.VITE_USE_MOCK_SERVICES !== "false",
  defaultUserId: import.meta.env.VITE_DEFAULT_USER_ID ?? "",
} as const
