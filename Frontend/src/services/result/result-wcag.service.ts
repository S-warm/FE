import { adaptWcagResponseToViewModel } from "@/adapters/result/result-wcag.adapter"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { SimulationWcagApiResponseDto } from "@/types/api/simulation/simulation-wcag.response"
import type { ResultWcagViewModel } from "@/types/view-model/result/result-wcag"

export interface ResultWcagService {
  getWcag(simulationId: string): Promise<ResultWcagViewModel>
}

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

export const resultWcagService: ResultWcagService = {
  async getWcag(simulationId) {
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
        return { pages: [] }
      }

      return adaptWcagResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return { pages: [] }
      }

      throw error
    }
  },
}
