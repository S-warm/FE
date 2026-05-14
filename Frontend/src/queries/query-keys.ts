import type { ResultAgeFilter } from "@/types/view-model/common/result-meta"

export const queryKeys = {
  simulations: {
    all: ["simulations"] as const,
    list: (userId: string) => ["simulations", "list", userId] as const,
    header: (simulationId: string, userId: string) =>
      ["simulations", "header", simulationId, userId] as const,
    status: (simulationId: string) =>
      ["simulations", "status", simulationId] as const,
  },
  results: {
    all: ["results"] as const,
    overview: (simulationId: string) =>
      ["results", simulationId, "overview"] as const,
    issues: (simulationId: string) =>
      ["results", simulationId, "issues"] as const,
    aiFix: (simulationId: string) =>
      ["results", simulationId, "ai-fix"] as const,
    heatmap: (params: {
      simulationId: string
      ageGroup: ResultAgeFilter
      page: number
      size: number
    }) =>
      [
        "results",
        params.simulationId,
        "heatmap",
        params.ageGroup,
        params.page,
        params.size,
      ] as const,
    wcag: (simulationId: string) => ["results", simulationId, "wcag"] as const,
  },
} as const
