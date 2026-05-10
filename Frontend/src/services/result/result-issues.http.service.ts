import { adaptIssuesResponseToViewModel } from "@/adapters/result"
import { httpClient } from "@/services/core/http-client"
import type { ResultIssuesService } from "@/services/result/result-issues.service"
import type { SimulationIssuesResponseDto } from "@/types/api/simulation/simulation-issues.response"

export const resultIssuesHttpService: ResultIssuesService = {
  async getIssues(simulationId) {
    const response = await httpClient.get<SimulationIssuesResponseDto>(
      `/simulations/${simulationId}/issues`,
    )
    return adaptIssuesResponseToViewModel(simulationId, response)
  },
}
