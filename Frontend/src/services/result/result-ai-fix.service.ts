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

function hasUsableAiFixPayload(apiResponse: SimulationAiFixApiResponseDto) {
  if ("url" in apiResponse) {
    return Array.isArray(apiResponse.fixes) && apiResponse.fixes.length > 0
  }

  return Array.isArray(apiResponse.pages) && apiResponse.pages.some((page) => page.fixes.length > 0)
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
