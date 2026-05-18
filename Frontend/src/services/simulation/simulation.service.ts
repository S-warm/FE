import { requestJson } from "@/services/core/http-client"
import type { GetSimulationHeaderParams, GetSimulationStatusParams } from "@/services/simulation/simulation.types"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationListItemDto } from "@/types/api/simulation/simulation-list.response"
import type { SimulationStatusResponseDto } from "@/types/api/simulation/simulation-status.response"
import type { ResultHeaderViewModel } from "@/types/view-model/simulation/result-header"
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

export interface SimulationService {
  createSimulation(input: SimulationCreateRequestDto, userId: string): Promise<SimulationCreateResponseDto>
  getSimulationList(userId: string): Promise<SimulationListItemViewModel[]>
  getSimulationHeader(params: GetSimulationHeaderParams): Promise<ResultHeaderViewModel | null>
  getSimulationStatus(params: GetSimulationStatusParams): Promise<SimulationStatusResponseDto>
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
  },
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
    case "completed":
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

  if (
    normalizedStatus === "failed" ||
    normalizedStatus === "error" ||
    normalizedStatus === "cancelled"
  ) {
    return 100
  }

  if (
    typeof raw.completed === "number" &&
    typeof raw.total === "number" &&
    raw.total > 0
  ) {
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
  raw: SimulationStatusApiDto,
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

export const simulationService: SimulationService = {
  async createSimulation(input, userId) {
    const raw = await requestJson<SimulationCreateResponseApiDto>("/api/simulations", {
      method: "POST",
      query: { userId },
      body: input,
    })

    return {
      projectId: raw.projectId,
      title: raw.title,
      status: raw.status,
      createdAt: raw.createdAt,
    }
  },
  async getSimulationList(userId) {
    const raw = await requestJson<SimulationListItemDto[]>("/api/simulations", {
      query: { userId },
    })

    return raw.map(mapSimulationListItemDtoToViewModel)
  },
  async getSimulationHeader({ simulationId, userId }: GetSimulationHeaderParams) {
    void simulationId
    void userId
    return null
  },
  async getSimulationStatus({ simulationId }: GetSimulationStatusParams) {
    const raw = await requestJson<SimulationStatusApiDto>(
      `/api/simulations/${simulationId}/status`,
    )

    return mapSimulationStatusResponse(simulationId, raw)
  },
}
