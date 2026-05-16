import { recentSimulations } from "@/mocks/simulation.mock"
import { requestJson } from "@/services/core/http-client"
import { mockDelay } from "@/services/core/mock-delay"
import type { SimulationService } from "@/services/simulation/simulation.service"
import type {
  GetSimulationHeaderParams,
  GetSimulationStatusParams,
} from "@/services/simulation/simulation.types"
import type { SimulationListItemDto } from "@/types/api/simulation/simulation-list.response"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationStatusResponseDto } from "@/types/api/simulation/simulation-status.response"
import type { ResultHeaderViewModel } from "@/types/view-model/common/result-header"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"

interface SimulationCreateResponseApiDto {
  projectId: string
  title: string
  status: string
  createdAt: string
}

interface SimulationStatusApiDto {
  status: string
  completed?: number | null
  total?: number | null
  failed?: number | null
}

const mockSimulationCreatedAt = new Map<string, string>()

function mapSimulationSummaryToListItem(
  simulation: (typeof recentSimulations)[number]
): SimulationListItemViewModel {
  return {
    simulationId: simulation.id,
    title: simulation.title,
    status: "completed",
    createdAt: simulation.createdAt,
    relativeCreatedAtLabel: simulation.createdAt,
    siteName: simulation.siteName,
  }
}

function mapSimulationSummaryToHeader(
  simulation: (typeof recentSimulations)[number]
): ResultHeaderViewModel {
  return {
    simulationId: simulation.id,
    title: simulation.title,
    status: "completed",
    createdAt: simulation.createdAt,
  }
}

function createMockSimulationResponse(
  input: SimulationCreateRequestDto
): SimulationCreateResponseDto {
  const createdAt = new Date().toISOString()
  const projectId = `mock-${Date.now()}`
  mockSimulationCreatedAt.set(projectId, createdAt)

  return {
    projectId,
    title: input.title,
    status: "pending",
    createdAt,
  }
}

function deriveSiteName(targetUrl?: string | null) {
  if (!targetUrl) {
    return undefined
  }

  try {
    return new URL(targetUrl).hostname
  } catch {
    return undefined
  }
}

function mapSimulationListItemDtoToViewModel(
  dto: SimulationListItemDto & {
    id?: string
    simulationId?: string
    siteName?: string
    targetUrl?: string
  }
): SimulationListItemViewModel {
  return {
    simulationId: dto.projectId ?? dto.id ?? dto.simulationId ?? "",
    title: dto.title,
    status: dto.status,
    createdAt: dto.createdAt,
    relativeCreatedAtLabel: dto.createdAt,
    siteName: dto.siteName ?? deriveSiteName(dto.targetUrl),
  }
}

function resolveStatusStep(status: string) {
  switch (status) {
    case "pending":
    case "queued":
      return "페이지 수집"
    case "running":
      return "시뮬레이션 실행"
    case "analyzing":
      return "결과 분석"
    case "completed":
      return "결과 분석"
    case "failed":
    case "error":
    case "cancelled":
      return "결과 분석"
    default:
      return "페이지 수집"
  }
}

function resolveStatusProgress(raw: SimulationStatusApiDto) {
  const normalizedStatus = String(raw.status ?? "").toLowerCase()

  if (normalizedStatus === "completed") {
    return 100
  }

  if (normalizedStatus === "failed" || normalizedStatus === "error" || normalizedStatus === "cancelled") {
    return 100
  }

  if (typeof raw.completed === "number" && typeof raw.total === "number" && raw.total > 0) {
    const ratio = Math.max(0, Math.min(1, raw.completed / raw.total))

    if (normalizedStatus === "running") {
      return Math.max(20, Math.min(85, Math.round(ratio * 80)))
    }

    if (normalizedStatus === "analyzing") {
      return Math.max(80, Math.min(98, Math.round(80 + ratio * 18)))
    }

    return Math.max(10, Math.min(95, Math.round(ratio * 100)))
  }

  if (normalizedStatus === "running") {
    return 60
  }

  if (normalizedStatus === "analyzing") {
    return 92
  }

  return 15
}

function mapSimulationStatusResponse(
  simulationId: string,
  raw: SimulationStatusApiDto
): SimulationStatusResponseDto {
  const normalizedStatus = String(raw.status ?? "").toLowerCase()

  return {
    id: simulationId,
    status: normalizedStatus,
    progress: resolveStatusProgress(raw),
    currentStep: resolveStatusStep(normalizedStatus),
    completed: raw.completed ?? undefined,
    total: raw.total ?? undefined,
    failed: raw.failed ?? undefined,
    updatedAt: new Date().toISOString(),
  }
}

function createMockSimulationStatus(
  simulationId: string
): SimulationStatusResponseDto {
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
      status: "running",
      progress: 45,
      currentStep: "시뮬레이션 실행",
      createdAt,
      updatedAt: new Date().toISOString(),
    }
  }

  if (elapsedMs < 6500) {
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
    const raw = await requestJson<SimulationCreateResponseApiDto>(
      "/api/simulations",
      {
        method: "POST",
        query: { userId },
        body: input,
      }
    )

    return {
      projectId: raw.projectId,
      title: raw.title,
      status: raw.status,
      createdAt: raw.createdAt,
    }
  },
  async getSimulationList(userId) {
    const raw = await requestJson<SimulationListItemDto[]>(
      "/api/simulations",
      {
        query: { userId },
      }
    )

    return raw.map(mapSimulationListItemDtoToViewModel)
  },
  async getSimulationHeader({ simulationId, userId }: GetSimulationHeaderParams) {
    void simulationId
    void userId

    // The current backend does not provide a dedicated
    // simulation header/detail endpoint yet.
    return null
  },
  async getSimulationStatus({ simulationId }: GetSimulationStatusParams) {
    const raw = await requestJson<SimulationStatusApiDto>(
      `/api/simulations/${simulationId}/status`
    )

    return mapSimulationStatusResponse(simulationId, raw)
  },
}
