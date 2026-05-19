import { adaptAiFixResponseToViewModel } from "@/adapters/result/result-ai-fix.adapter"
import { tryLoadDevFallbackJson } from "@/services/core/dev-fallback-json"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { SimulationAiFixApiResponseDto } from "@/types/api/simulation/simulation-ai-fix.response"
import type { ResultAiFixViewModel } from "@/types/view-model/result/result-ai-fix"

export interface ResultAiFixService {
  getAiFix(simulationId: string): Promise<ResultAiFixViewModel>
}

const AI_FIX_FALLBACK_PATH = "/_mock_AI수정.json"
const AI_FIX_ENDPOINT = "/api/simulations/:simulationId/ai-fix"

function createAiFixPayloadError(message: string) {
  return new ApiServiceError({
    status: 502,
    error: "Invalid AI Fix Payload",
    message,
    path: AI_FIX_ENDPOINT,
  })
}

function hasUsableAiFixPayload(apiResponse: SimulationAiFixApiResponseDto) {
  if ("url" in apiResponse) {
    return Array.isArray(apiResponse.fixes)
  }

  return Array.isArray(apiResponse.pages)
}

function hasRecognizableAiFixPayload(apiResponse: SimulationAiFixApiResponseDto) {
  return ("url" in apiResponse && Array.isArray(apiResponse.fixes)) ||
    ("pages" in apiResponse && Array.isArray(apiResponse.pages))
}

function hasCompleteAiFixSeverity(apiResponse: SimulationAiFixApiResponseDto) {
  if ("url" in apiResponse) {
    return apiResponse.fixes.every((fix) => typeof fix.severity === "string" && fix.severity.trim())
  }

  return apiResponse.pages.every((page) =>
    page.fixes.every((fix) => typeof fix.severity === "string" && fix.severity.trim())
  )
}

async function getAiFixFallback(simulationId: string) {
  const fallbackResponse =
    await tryLoadDevFallbackJson<SimulationAiFixApiResponseDto>(AI_FIX_FALLBACK_PATH)

  if (!fallbackResponse) {
    return null
  }

  return adaptAiFixResponseToViewModel(simulationId, fallbackResponse)
}

export const resultAiFixService: ResultAiFixService = {
  async getAiFix(simulationId) {
    try {
      const apiResponse = await requestJsonWithFallback<SimulationAiFixApiResponseDto>([
        `/api/simulations/${simulationId}/ai-fix`,
        `/api/simulations/${simulationId}/results/ai-fix`,
        `/api/simulations/${simulationId}/ai`,
        `/simulations/${simulationId}/ai-fix`,
      ])

      if (!hasRecognizableAiFixPayload(apiResponse)) {
        throw createAiFixPayloadError(
          "AI 수정 응답 형식이 예상과 다릅니다. 서버 payload 구조를 확인해 주세요."
        )
      }

      if (!hasCompleteAiFixSeverity(apiResponse)) {
        throw createAiFixPayloadError(
          "AI 수정 응답에 severity 값이 누락되었습니다. 서버에서 각 수정안의 severity를 반드시 내려줘야 합니다."
        )
      }

      if (!hasUsableAiFixPayload(apiResponse)) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getAiFixFallback(simulationId)
          if (fallbackViewModel) {
            return fallbackViewModel
          }
        }

        return { pages: [] }
      }

      return adaptAiFixResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getAiFixFallback(simulationId)
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
