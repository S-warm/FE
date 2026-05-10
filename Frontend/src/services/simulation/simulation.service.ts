import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationStatusViewModel } from "@/types/view-model/simulation/simulation-status"
import type { ResultHeaderViewModel } from "@/types/view-model/simulation/result-header"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"
import type { GetSimulationHeaderParams } from "@/services/simulation/simulation.types"

export interface SimulationService {
  createSimulation(input: SimulationCreateRequestDto, userId: string): Promise<SimulationCreateResponseDto>
  getSimulationList(userId: string): Promise<SimulationListItemViewModel[]>
  getSimulationHeader(params: GetSimulationHeaderParams): Promise<ResultHeaderViewModel | null>
  getSimulationStatus(simulationId: string): Promise<SimulationStatusViewModel>
}
