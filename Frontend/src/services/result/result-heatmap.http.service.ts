import { adaptHeatmapResponseToViewModel } from "@/adapters/result"
import { httpClient } from "@/services/core/http-client"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"
import type { SimulationHeatmapResponseDto } from "@/types/api/simulation/simulation-heatmap.response"

export const resultHeatmapHttpService: ResultHeatmapService = {
  async getHeatmap(params) {
    const response = await httpClient.get<SimulationHeatmapResponseDto>(
      `/simulations/${params.simulationId}/heatmap`,
      {
        query: {
          ageGroup: params.ageGroup,
          page: params.page,
          size: params.size,
        },
      },
    )
    return adaptHeatmapResponseToViewModel(params.simulationId, response)
  },
}
