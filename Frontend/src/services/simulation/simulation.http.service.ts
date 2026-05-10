import { httpClient } from "@/services/core/http-client"
import type { SimulationService } from "@/services/simulation/simulation.service"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationListItemDto } from "@/types/api/simulation/simulation-list.response"
import type { ResultHeaderViewModel } from "@/types/view-model/common/result-header"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"

function adaptSimulationListItemToViewModel(
  raw: SimulationListItemDto,
): SimulationListItemViewModel {
  return {
    simulationId: raw.id,
    title: raw.title,
    status: raw.status,
    createdAt: raw.createdAt,
    relativeCreatedAtLabel: raw.createdAt,
  }
}

function adaptSimulationHeaderToViewModel(
  raw: SimulationCreateResponseDto,
): ResultHeaderViewModel {
  return {
    simulationId: raw.id,
    title: raw.title,
    status: raw.status,
    createdAt: raw.createdAt,
  }
}

export const simulationHttpService: SimulationService = {
  createSimulation(input: SimulationCreateRequestDto, userId: string) {
    return httpClient.post<SimulationCreateResponseDto>("/simulations", input, {
      headers: {
        "X-User-Id": userId,
      },
    })
  },

  async getSimulationList(userId: string) {
    const response = await httpClient.get<SimulationListItemDto[]>(
      `/users/${userId}/simulations`,
    )
    return response.map(adaptSimulationListItemToViewModel)
  },

  async getSimulationHeader({ simulationId }) {
    const response = await httpClient.get<SimulationCreateResponseDto>(
      `/simulations/${simulationId}`,
    )
    return adaptSimulationHeaderToViewModel(response)
  },
}
