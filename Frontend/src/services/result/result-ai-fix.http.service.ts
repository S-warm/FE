import { adaptAiFixResponseToViewModel } from "@/adapters/result"
import { httpClient } from "@/services/core/http-client"
import type { ResultAiFixService } from "@/services/result/result-ai-fix.service"
import type { SimulationAiFixResponseDto } from "@/types/api/simulation/simulation-ai-fix.response"

export const resultAiFixHttpService: ResultAiFixService = {
  async getAiFix(simulationId) {
    const response = await httpClient.get<SimulationAiFixResponseDto>(
      `/simulations/${simulationId}/ai-fix`,
    )
    return adaptAiFixResponseToViewModel(simulationId, response)
  },
}
