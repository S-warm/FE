import { adaptOverviewResponseToViewModel } from "@/adapters/result/result-overview.adapter"
import { ApiServiceError } from "@/services/core/api-service-error"
import { tryLoadDevFallbackJson } from "@/services/core/dev-fallback-json"
import { requestJsonWithFallback } from "@/services/core/http-client"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { ResultOverviewViewModel } from "@/types/view-model/result/result-overview"

export interface ResultOverviewService {
  getOverview(simulationId: string): Promise<ResultOverviewViewModel | null>
}

const OVERVIEW_FALLBACK_PATH = "/_mock_개요.json"

async function getOverviewFallback(simulationId: string) {
  const fallbackResponse =
    await tryLoadDevFallbackJson<SimulationOverviewResponseDto>(OVERVIEW_FALLBACK_PATH)

  if (!fallbackResponse) {
    return null
  }

  return adaptOverviewResponseToViewModel(simulationId, fallbackResponse)
}

export const resultOverviewService: ResultOverviewService = {
  async getOverview(simulationId) {
    if (SERVICE_CONFIG.useSimulationMock) {
      return getOverviewFallback(simulationId)
    }

    try {
      const apiResponse = await requestJsonWithFallback<SimulationOverviewResponseDto>([
        `/api/simulations/${simulationId}/overview`,
        `/api/simulations/${simulationId}/results/overview`,
        `/simulations/${simulationId}/overview`,
      ])

      return adaptOverviewResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (import.meta.env.DEV && error instanceof ApiServiceError && error.status === 404) {
        const fallbackViewModel = await getOverviewFallback(simulationId)
        if (fallbackViewModel) {
          return fallbackViewModel
        }
      }

      throw error
    }
  },
}
