import { adaptOverviewResponseToViewModel } from "@/adapters/result/result-overview.adapter"
import { tryLoadDevFallbackJson } from "@/services/core/dev-fallback-json"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJson } from "@/services/core/http-client"
import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { ResultOverviewViewModel } from "@/types/view-model/result/result-overview"

export interface ResultOverviewService {
  getOverview(simulationId: string): Promise<ResultOverviewViewModel | null>
}

const OVERVIEW_FALLBACK_PATH = "/_mock_개요.json"

function createEmptyOverviewViewModel(): ResultOverviewViewModel {
  return {
    summary: {
      taskSuccessRateLabel: "0%",
      totalAgentsLabel: "0명",
      avgCompletionTimeLabel: "0초",
      dropOffAgentsLabel: "0명",
    },
    pages: [],
    ageStats: [],
  }
}

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
    try {
      const apiResponse = await requestJson<SimulationOverviewResponseDto>(
        `/api/simulations/${simulationId}/overview`
      )

      return adaptOverviewResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (import.meta.env.DEV && error instanceof ApiServiceError && error.status === 404) {
        const fallbackViewModel = await getOverviewFallback(simulationId)
        if (fallbackViewModel) {
          return fallbackViewModel
        }
      }

      if (error instanceof ApiServiceError && error.status === 404) {
        return createEmptyOverviewViewModel()
      }

      throw error
    }
  },
}
