import { mockDelay } from "@/services/core/mock-delay"
import type { SimulationService } from "@/services/simulation/simulation.service"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import { recentSimulations } from "@/mocks/simulation.mock"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"
import type { ResultHeaderViewModel } from "@/types/view-model/common/result-header"

function mapSimulationSummaryToListItem(simulation: (typeof recentSimulations)[number]): SimulationListItemViewModel {
  return {
    simulationId: simulation.id,
    title: simulation.title,
    status: "completed",
    createdAt: simulation.createdAt,
    relativeCreatedAtLabel: simulation.createdAt,
    siteName: simulation.siteName,
  }
}

function mapSimulationSummaryToHeader(simulation: (typeof recentSimulations)[number]): ResultHeaderViewModel {
  return {
    simulationId: simulation.id,
    title: simulation.title,
    status: "completed",
    createdAt: simulation.createdAt,
  }
}

function createMockSimulationResponse(input: SimulationCreateRequestDto): SimulationCreateResponseDto {
  return {
    id: `mock-${Date.now()}`,
    title: input.title,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
}

export const simulationMockService: SimulationService = {
  async createSimulation(input) {
    await mockDelay()
    return createMockSimulationResponse(input)
  },
  async getSimulationList() {
    await mockDelay()
    return recentSimulations.map(mapSimulationSummaryToListItem)
  },
  async getSimulationHeader({ simulationId }) {
    await mockDelay()
    const target = recentSimulations.find((simulation) => simulation.id === simulationId)
    return target ? mapSimulationSummaryToHeader(target) : null
  },
}
