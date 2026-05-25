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
  // Support format detection in order of preference:
  // 1. pages[] format (preferred - supports per-page breakdown)
  // 2. urls object format (supports per-URL breakdown)
  // 3. legacy format (aggregate with summary/distribution)
  // 4. flat format (basic aggregate - no per-page support)

  const hasPagesFormat = "pages" in apiResponse && Array.isArray(apiResponse.pages)
  const hasUrlsFormat = "urls" in apiResponse && typeof apiResponse.urls === "object" && apiResponse.urls !== null
  const hasLegacyFormat = "summary" in apiResponse && "distribution" in apiResponse && Array.isArray(apiResponse.issues)
  const hasFlatFormat =
    "score" in apiResponse &&
    "wcagLabel" in apiResponse &&
    "distributionCritical" in apiResponse &&
    "distributionModerate" in apiResponse &&
    "distributionMinor" in apiResponse &&
    Array.isArray(apiResponse.issues)

  const isRecognizable = hasPagesFormat || hasUrlsFormat || hasLegacyFormat || hasFlatFormat

  if (isRecognizable && process.env.NODE_ENV === "development") {
    if (hasFlatFormat && !hasPagesFormat && !hasUrlsFormat && !hasLegacyFormat) {
      console.log(
        "[WCAG Service] Detected flat format response. Note: For per-page WCAG error breakdown, backend should return pages[] format instead."
      )
    }
  }

  return isRecognizable
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
