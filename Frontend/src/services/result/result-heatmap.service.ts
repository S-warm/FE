import { adaptHeatmapResponseToViewModel } from "@/adapters/result/result-heatmap.adapter"
import { tryLoadDevFallbackJson } from "@/services/core/dev-fallback-json"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { GetResultHeatmapParams } from "@/services/result/result.types"
import type { SimulationHeatmapApiResponseDto } from "@/types/api/simulation/simulation-heatmap.response"
import type { ResultHeatmapViewModel } from "@/types/view-model/result/result-heatmap"

export interface ResultHeatmapService {
  getHeatmap(params: GetResultHeatmapParams): Promise<ResultHeatmapViewModel>
}

const HEATMAP_FALLBACK_PATH = "/_mock_히트맵.json"

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

async function getHeatmapFallback(params: GetResultHeatmapParams) {
  const fallbackResponse =
    await tryLoadDevFallbackJson<SimulationHeatmapApiResponseDto>(HEATMAP_FALLBACK_PATH)

  if (!fallbackResponse) {
    return null
  }

  return adaptHeatmapResponseToViewModel(params.simulationId, fallbackResponse, params)
}

export const resultHeatmapService: ResultHeatmapService = {
  async getHeatmap(params) {
    try {
      const apiResponse = await requestHeatmap(params)

      if (!hasUsableHeatmapPayload(apiResponse)) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getHeatmapFallback(params)
          if (fallbackViewModel) {
            return fallbackViewModel
          }
        }

        return { pages: [] }
      }

      return adaptHeatmapResponseToViewModel(params.simulationId, apiResponse, params)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getHeatmapFallback(params)
          if (fallbackViewModel) {
            return fallbackViewModel
          }
        }

        return { pages: [] }
      }

      throw error
    }
  },
}
