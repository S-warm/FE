import { mockDelay } from "@/services/core/mock-delay"
import type { SimulationService } from "@/services/simulation/simulation.service"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationStatusViewModel } from "@/types/view-model/simulation/simulation-status"
import { recentSimulations } from "@/mocks/simulation.mock"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"
import type { ResultHeaderViewModel } from "@/types/view-model/common/result-header"

const mockStatusCallCounts = new Map<string, number>()
const mockCreatedHeaders = new Map<string, ResultHeaderViewModel>()
const MOCK_STATUS_SEQUENCE: SimulationStatusViewModel[] = [
  { status: "pending", progress: 12, activeStepIndex: 0 },
  { status: "pending", progress: 28, activeStepIndex: 0 },
  { status: "running", progress: 46, activeStepIndex: 1 },
  { status: "running", progress: 68, activeStepIndex: 2 },
  { status: "running", progress: 84, activeStepIndex: 2 },
  { status: "completed", progress: 100, activeStepIndex: 3 },
]

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
  const id = `mock-${Date.now()}`
  const createdAt = new Date().toISOString()
  mockStatusCallCounts.set(id, 0)
  mockCreatedHeaders.set(id, {
    simulationId: id,
    title: input.title,
    status: "completed",
    createdAt,
  })

  return {
    id,
    title: input.title,
    status: "pending",
    createdAt,
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
    const createdHeader = mockCreatedHeaders.get(simulationId)
    if (createdHeader) {
      return createdHeader
    }
    const target = recentSimulations.find((simulation) => simulation.id === simulationId)
    return target ? mapSimulationSummaryToHeader(target) : null
  },
  async getSimulationStatus(simulationId) {
    await mockDelay()

    const currentCount = mockStatusCallCounts.get(simulationId) ?? 0
    const nextCount = Math.min(
      currentCount + 1,
      MOCK_STATUS_SEQUENCE.length - 1,
    )

    mockStatusCallCounts.set(simulationId, nextCount)
    return MOCK_STATUS_SEQUENCE[nextCount]
  },
}
