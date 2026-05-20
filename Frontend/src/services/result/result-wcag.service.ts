import { adaptWcagResponseToViewModel } from "@/adapters/result/result-wcag.adapter"
import { tryLoadDevFallbackJson } from "@/services/core/dev-fallback-json"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import type { SimulationWcagApiResponseDto } from "@/types/api/simulation/simulation-wcag.response"
import type { ResultWcagViewModel } from "@/types/view-model/result/result-wcag"

export interface ResultWcagService {
  getWcag(simulationId: string): Promise<ResultWcagViewModel>
}

const WCAG_FALLBACK_PATH = "/_mock_wcag.json"
const WCAG_ENDPOINT = "/api/simulations/:simulationId/wcag"

function createWcagPayloadError(message: string) {
  return new ApiServiceError({
    status: 502,
    error: "Invalid WCAG Payload",
    message,
    path: WCAG_ENDPOINT,
  })
}

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

function hasRecognizableWcagPayload(apiResponse: SimulationWcagApiResponseDto) {
  return ("urls" in apiResponse && typeof apiResponse.urls === "object" && apiResponse.urls !== null) ||
    ("summary" in apiResponse && "distribution" in apiResponse && Array.isArray(apiResponse.issues)) ||
    ("score" in apiResponse &&
      "wcagLabel" in apiResponse &&
      "distributionCritical" in apiResponse &&
      "distributionModerate" in apiResponse &&
      "distributionMinor" in apiResponse &&
      Array.isArray(apiResponse.issues))
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
    if (SERVICE_CONFIG.useSimulationMock) {
      const fallbackViewModel = await getWcagFallback(simulationId)
      return fallbackViewModel ?? { pages: [] }
    }

    try {
      const apiResponse = await requestJsonWithFallback<SimulationWcagApiResponseDto>([
        `/api/simulations/${simulationId}/wcag`,
        `/api/simulations/${simulationId}/results/wcag`,
        `/simulations/${simulationId}/wcag`,
      ])

      if (!hasRecognizableWcagPayload(apiResponse)) {
        throw createWcagPayloadError(
          "WCAG 응답 형식이 예상과 다릅니다. 서버 payload 구조를 확인해 주세요."
        )
      }

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
