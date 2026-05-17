export const SERVICE_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  useMockServices: import.meta.env.VITE_USE_MOCK_SERVICES !== "false",
  useOverviewPreviewData: import.meta.env.VITE_USE_OVERVIEW_PREVIEW_DATA === "true",
  useIssuesPreviewData: import.meta.env.VITE_USE_ISSUES_PREVIEW_DATA === "true",
  useHeatmapPreviewData: import.meta.env.VITE_USE_HEATMAP_PREVIEW_DATA === "true",
  defaultUserId:
    import.meta.env.VITE_DEFAULT_USER_ID ??
    (import.meta.env.VITE_USE_MOCK_SERVICES !== "false" ? "mock-user" : ""),
} as const
