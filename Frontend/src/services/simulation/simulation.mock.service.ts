import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { SimulationService } from "@/services/simulation/simulation.service"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationStatusResponseDto } from "@/types/api/simulation/simulation-status.response"
import { recentSimulations } from "@/mocks/simulation.mock"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"
import type { ResultHeaderViewModel } from "@/types/view-model/common/result-header"
import type { SimulationListItemDto } from "@/types/api/simulation/simulation-list.response"

const mockSimulationCreatedAt = new Map<string, string>()

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
  const createdAt = new Date().toISOString()
  const id = `mock-${Date.now()}`
  mockSimulationCreatedAt.set(id, createdAt)

  return {
    id,
    title: input.title,
    status: "pending",
    createdAt,
  }
}

function deriveSiteName(targetUrl?: string | null) {
  if (!targetUrl) return undefined

  try {
    return new URL(targetUrl).hostname
  } catch {
    return undefined
  }
}

function mapSimulationListItemDtoToViewModel(
  dto: SimulationListItemDto & {
    simulationId?: string
    siteName?: string
    targetUrl?: string
  }
): SimulationListItemViewModel {
  return {
    simulationId: dto.id ?? dto.simulationId ?? "",
    title: dto.title,
    status: dto.status,
    createdAt: dto.createdAt,
    relativeCreatedAtLabel: dto.createdAt,
    siteName: dto.siteName ?? deriveSiteName(dto.targetUrl),
  }
}

function mapSimulationHeaderResponseToViewModel(raw: {
  id?: string
  simulationId?: string
  title: string
  status?: string
  createdAt: string
}): ResultHeaderViewModel {
  return {
    simulationId: raw.id ?? raw.simulationId ?? "",
    title: raw.title,
    status: raw.status,
    createdAt: raw.createdAt,
  }
}

function createMockSimulationStatus(simulationId: string): SimulationStatusResponseDto {
  const createdAt = mockSimulationCreatedAt.get(simulationId) ?? new Date().toISOString()
  const elapsedMs = Date.now() - new Date(createdAt).getTime()

  if (elapsedMs < 2000) {
    return {
      id: simulationId,
      status: "queued",
      progress: 15,
      currentStep: "페이지 수집",
      createdAt,
      updatedAt: new Date().toISOString(),
    }
  }

  if (elapsedMs < 4000) {
    return {
      id: simulationId,
      status: "generating_personas",
      progress: 35,
      currentStep: "페르소나 생성",
      createdAt,
      updatedAt: new Date().toISOString(),
    }
  }

  if (elapsedMs < 6500) {
    return {
      id: simulationId,
      status: "running",
      progress: 70,
      currentStep: "시뮬레이션 실행",
      createdAt,
      updatedAt: new Date().toISOString(),
    }
  }

  if (elapsedMs < 8500) {
    return {
      id: simulationId,
      status: "analyzing",
      progress: 92,
      currentStep: "결과 분석",
      createdAt,
      updatedAt: new Date().toISOString(),
    }
  }

  return {
    id: simulationId,
    status: "completed",
    progress: 100,
    currentStep: "결과 분석",
    createdAt,
    updatedAt: new Date().toISOString(),
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
  async getSimulationStatus({ simulationId }) {
    await mockDelay()
    return createMockSimulationStatus(simulationId)
  },
}

export const simulationHttpService: SimulationService = {
  async createSimulation(input, userId) {
    return requestJsonWithFallback<SimulationCreateResponseDto>(
      ["/api/simulations", "/simulations"],
      {
        method: "POST",
        query: { userId },
        body: input,
      }
    )
  },
  async getSimulationList(userId) {
    const raw = await requestJsonWithFallback<SimulationListItemDto[]>(
      [
        `/api/users/${userId}/simulations`,
        "/api/simulations",
        "/simulations",
      ],
      {
        query: { userId },
      }
    )

    return raw.map(mapSimulationListItemDtoToViewModel)
  },
  async getSimulationHeader({ simulationId, userId }) {
    const raw = await requestJsonWithFallback<{
      id?: string
      simulationId?: string
      title: string
      status?: string
      createdAt: string
    } | null>(
      [
        `/api/users/${userId}/simulations/${simulationId}`,
        `/api/simulations/${simulationId}`,
        `/simulations/${simulationId}`,
      ],
      {
        query: { userId },
      }
    )

    return raw ? mapSimulationHeaderResponseToViewModel(raw) : null
  },
  async getSimulationStatus({ simulationId }) {
    return requestJsonWithFallback<SimulationStatusResponseDto>(
      [
        `/api/simulations/${simulationId}/status`,
        `/simulations/${simulationId}/status`,
      ]
    )
  },
}
