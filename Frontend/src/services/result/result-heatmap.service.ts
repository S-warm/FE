import { adaptHeatmapResponseToViewModel } from "@/adapters/result/result-heatmap.adapter"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { GetResultHeatmapParams } from "@/services/result/result.types"
import type { SimulationHeatmapApiResponseDto } from "@/types/api/simulation/simulation-heatmap.response"
import type { ResultHeatmapViewModel } from "@/types/view-model/result/result-heatmap"

export interface ResultHeatmapService {
  getHeatmap(params: GetResultHeatmapParams): Promise<ResultHeatmapViewModel>
}

function hasUsableHeatmapPayload(apiResponse: SimulationHeatmapApiResponseDto) {
  if ("errorPoints" in apiResponse) {
    return Array.isArray(apiResponse.errorPoints) && apiResponse.errorPoints.length > 0
  }

  return (
    Array.isArray(apiResponse.pages) &&
    apiResponse.pages.some(
      (page) => Array.isArray(page.errorPoints) && page.errorPoints.length > 0
    )
  )
}

async function requestHeatmap(params: GetResultHeatmapParams) {
  return requestJsonWithFallback<SimulationHeatmapApiResponseDto>([
    `/api/simulations/${params.simulationId}/heatmap`,
    `/api/simulations/${params.simulationId}/results/heatmap`,
    `/simulations/${params.simulationId}/heatmap`,
  ])
}

export const resultHeatmapService: ResultHeatmapService = {
  async getHeatmap(params) {
    try {
      const apiResponse = await requestHeatmap(params)

      if (!hasUsableHeatmapPayload(apiResponse)) {
        return { pages: [] }
      }

      return adaptHeatmapResponseToViewModel(params.simulationId, apiResponse, params)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return { pages: [] }
      }

      throw error
    }
  },
}
