import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationStatusResponseDto } from "@/types/api/simulation/simulation-status.response"
import type { ResultHeaderViewModel } from "@/types/view-model/simulation/result-header"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"
import type {
  GetSimulationHeaderParams,
  GetSimulationStatusParams,
} from "@/services/simulation/simulation.types"

export interface SimulationService {
  createSimulation(input: SimulationCreateRequestDto, userId: string): Promise<SimulationCreateResponseDto>
  getSimulationList(userId: string): Promise<SimulationListItemViewModel[]>
  getSimulationHeader(params: GetSimulationHeaderParams): Promise<ResultHeaderViewModel | null>
  getSimulationStatus(params: GetSimulationStatusParams): Promise<SimulationStatusResponseDto>
}
