import { adaptOverviewResponseToViewModel } from "@/adapters/result"
import { httpClient } from "@/services/core/http-client"
import type { ResultOverviewService } from "@/services/result/result-overview.service"
import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"

export const resultOverviewHttpService: ResultOverviewService = {
  async getOverview(simulationId) {
    const response = await httpClient.get<SimulationOverviewResponseDto>(
      `/simulations/${simulationId}/overview`,
    )
    return adaptOverviewResponseToViewModel(simulationId, response)
  },
}
