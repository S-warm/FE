import { adaptOverviewResponseToViewModel } from "@/adapters/result/result-overview.adapter"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { ResultOverviewViewModel } from "@/types/view-model/result/result-overview"

export interface ResultOverviewService {
  getOverview(simulationId: string): Promise<ResultOverviewViewModel | null>
}

export const resultOverviewService: ResultOverviewService = {
  async getOverview(simulationId) {
    try {
      const apiResponse = await requestJsonWithFallback<SimulationOverviewResponseDto>([
        `/api/simulations/${simulationId}/overview`,
        `/api/simulations/${simulationId}/results/overview`,
        `/simulations/${simulationId}/overview`,
      ])

      return adaptOverviewResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return null
      }

      throw error
    }
  },
}
