import { adaptIssuesResponseToViewModel } from "@/adapters/result/result-issues.adapter"
import { ApiServiceError } from "@/services/core/api-service-error"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { SimulationIssuesApiResponseDto } from "@/types/api/simulation/simulation-issues.response"
import type { ResultIssuesViewModel } from "@/types/view-model/result/result-issues"

export interface ResultIssuesService {
  getIssues(simulationId: string): Promise<ResultIssuesViewModel>
}

function hasUsableIssuesPayload(apiResponse: SimulationIssuesApiResponseDto) {
  if ("total_issues" in apiResponse) {
    return Array.isArray(apiResponse.issues) && apiResponse.issues.length > 0
  }

  return (
    Array.isArray(apiResponse.pages) &&
    apiResponse.pages.some((page) => page.issues.length > 0)
  )
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
        return { pages: [] }
      }

      return adaptIssuesResponseToViewModel(simulationId, apiResponse)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return { pages: [] }
      }

      throw error
    }
  },
}
