import { adaptWcagResponseToViewModel } from "@/adapters/result/result-wcag.adapter"
import { tryLoadDevFallbackJson } from "@/services/core/dev-fallback-json"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { SimulationWcagApiResponseDto } from "@/types/api/simulation/simulation-wcag.response"
import type { ResultWcagViewModel } from "@/types/view-model/result/result-wcag"

export interface ResultWcagService {
  getWcag(simulationId: string): Promise<ResultWcagViewModel>
}

const WCAG_FALLBACK_PATH = "/_mock_wcag.json"

function hasUsableWcagPayload(apiResponse: SimulationWcagApiResponseDto) {
  if ("urls" in apiResponse) {
    return typeof apiResponse.urls === "object" && apiResponse.urls !== null
  }

  if ("summary" in apiResponse && "distribution" in apiResponse) {
    return Array.isArray(apiResponse.issues)
  }

  return (
    "score" in apiResponse &&
    "wcagLabel" in apiResponse &&
    "distributionCritical" in apiResponse &&
    "distributionModerate" in apiResponse &&
    "distributionMinor" in apiResponse &&
    Array.isArray(apiResponse.issues)
  )
}

async function getWcagFallback(simulationId: string) {
  const fallbackResponse =
    await tryLoadDevFallbackJson<SimulationWcagApiResponseDto>(WCAG_FALLBACK_PATH)

  if (!fallbackResponse) {
    return null
  }

  return adaptWcagResponseToViewModel(simulationId, fallbackResponse)
}

export const resultWcagService: ResultWcagService = {
  async getWcag(simulationId) {
    try {
      const apiResponse = await requestJsonWithFallback<SimulationWcagApiResponseDto>([
        `/api/simulations/${simulationId}/wcag`,
        `/api/simulations/${simulationId}/results/wcag`,
        `/simulations/${simulationId}/wcag`,
      ])

      if (!hasUsableWcagPayload(apiResponse)) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getWcagFallback(simulationId)
          if (fallbackViewModel) {
            return fallbackViewModel
          }
        }

        return { pages: [] }
      }

      return adaptWcagResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getWcagFallback(simulationId)
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
