import { adaptWcagResponseToViewModel } from "@/adapters/result"
import { httpClient } from "@/services/core/http-client"
import type { ResultWcagService } from "@/services/result/result-wcag.service"
import type { SimulationWcagResponseDto } from "@/types/api/simulation/simulation-wcag.response"

export const resultWcagHttpService: ResultWcagService = {
  async getWcag(simulationId) {
    const response = await httpClient.get<SimulationWcagResponseDto>(
      `/simulations/${simulationId}/wcag`,
    )
    // 현재 DTO 는 simulation-level summary/distribution/issues 만 제공한다고 가정한다.
    // page-level context 가 필요해지면 Step 21 에서 adapter 입력 정책을 다시 맞춘다.
    return adaptWcagResponseToViewModel(simulationId, response)
  },
}
