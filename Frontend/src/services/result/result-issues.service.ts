import { adaptIssuesResponseToViewModel } from "@/adapters/result/result-issues.adapter"
import { tryLoadDevFallbackJson } from "@/services/core/dev-fallback-json"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { SimulationIssuesApiResponseDto } from "@/types/api/simulation/simulation-issues.response"
import type { ResultIssuesViewModel } from "@/types/view-model/result/result-issues"

export interface ResultIssuesService {
  getIssues(simulationId: string): Promise<ResultIssuesViewModel>
}

const ISSUES_FALLBACK_PATH = "/_mock_주요이슈.json"

function hasUsableIssuesPayload(apiResponse: SimulationIssuesApiResponseDto) {
  if ("total_issues" in apiResponse) {
    return Array.isArray(apiResponse.issues) && apiResponse.issues.length > 0
  }

  return (
    Array.isArray(apiResponse.pages) &&
    apiResponse.pages.some((page) => page.issues.length > 0)
  )
}

async function getIssuesFallback(simulationId: string) {
  const fallbackResponse =
    await tryLoadDevFallbackJson<SimulationIssuesApiResponseDto>(ISSUES_FALLBACK_PATH)

  if (!fallbackResponse) {
    return null
  }

  return adaptIssuesResponseToViewModel(simulationId, fallbackResponse)
}

export const resultIssuesService: ResultIssuesService = {
  async getIssues(simulationId) {
    try {
      const apiResponse = await requestJsonWithFallback<SimulationIssuesApiResponseDto>([
        `/api/simulations/${simulationId}/issues`,
        `/api/simulations/${simulationId}/results/issues`,
        `/simulations/${simulationId}/issues`,
      ])

      if (!hasUsableIssuesPayload(apiResponse)) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getIssuesFallback(simulationId)
          if (fallbackViewModel) {
            return fallbackViewModel
          }
        }

        return { pages: [] }
      }

      return adaptIssuesResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        if (import.meta.env.DEV) {
          const fallbackViewModel = await getIssuesFallback(simulationId)
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
