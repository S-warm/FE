function resolveBooleanEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === "true") return true
  if (normalized === "false") return false

  return fallback
}

export const SERVICE_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  appOrigin: import.meta.env.VITE_APP_ORIGIN ?? "http://localhost:3000",
  defaultUserId: import.meta.env.VITE_DEFAULT_USER_ID ?? "",
  useSimulationMock: resolveBooleanEnv(
    import.meta.env.VITE_USE_SIMULATION_MOCK,
    import.meta.env.DEV,
  ),
} as const
