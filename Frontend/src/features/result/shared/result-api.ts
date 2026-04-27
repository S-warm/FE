import { requestJson } from "@/shared/api/http-client"
import type {
  BackendHeatmapAgeGroup,
  BackendSimulationAiFixResponse,
  BackendSimulationHeatmapResponse,
  BackendSimulationIssuesResponse,
  BackendSimulationListItem,
  BackendSimulationOverviewResponse,
  BackendSimulationWcagAggregateResponse,
} from "@/shared/types/backend-api"

export async function fetchSimulationList(userId: string, signal?: AbortSignal) {
  return requestJson<BackendSimulationListItem[]>("/simulations", {
    signal,
    query: {
      userId,
    },
  })
}

export async function fetchSimulationOverview(simulationId: string, signal?: AbortSignal) {
  return requestJson<BackendSimulationOverviewResponse>(`/simulations/${simulationId}/overview`, {
    signal,
  })
}

export async function fetchSimulationIssues(simulationId: string, signal?: AbortSignal) {
  return requestJson<BackendSimulationIssuesResponse>(`/simulations/${simulationId}/issues`, {
    signal,
  })
}

export async function fetchSimulationAiFix(simulationId: string, signal?: AbortSignal) {
  return requestJson<BackendSimulationAiFixResponse>(`/simulations/${simulationId}/ai-fix`, {
    signal,
  })
}

export async function fetchSimulationHeatmap(
  simulationId: string,
  params: {
    ageGroup?: BackendHeatmapAgeGroup
    page?: number
    size?: number
  } = {},
  signal?: AbortSignal
) {
  return requestJson<BackendSimulationHeatmapResponse>(`/simulations/${simulationId}/heatmap`, {
    signal,
    query: {
      ageGroup: params.ageGroup ?? "all",
      page: params.page ?? 0,
      size: params.size ?? 100,
    },
  })
}

export async function fetchSimulationWcag(simulationId: string, signal?: AbortSignal) {
  return requestJson<BackendSimulationWcagAggregateResponse>(`/simulations/${simulationId}/wcag`, {
    signal,
  })
}
