import { httpClient } from "@/services/core/http-client"
import type { SimulationService } from "@/services/simulation/simulation.service"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type { SimulationCreateResponseDto } from "@/types/api/simulation/simulation-create.response"
import type { SimulationListItemDto } from "@/types/api/simulation/simulation-list.response"
import type { SimulationStatusResponseDto } from "@/types/api/simulation/simulation-status.response"
import type { ResultHeaderViewModel } from "@/types/view-model/common/result-header"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"
import type {
  SimulationStatusValue,
  SimulationStatusViewModel,
} from "@/types/view-model/simulation/simulation-status"

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

function clampProgress(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.min(100, Math.round(value ?? fallback)))
}

function normalizeStatus(value: string | undefined): SimulationStatusValue {
  switch ((value ?? "").toLowerCase()) {
    case "completed":
    case "success":
      return "completed"
    case "failed":
    case "error":
    case "cancelled":
      return "failed"
    case "running":
    case "processing":
    case "inprogress":
      return "running"
    default:
      return "pending"
  }
}

function deriveActiveStepIndex(
  progress: number,
  currentStepIndex?: number,
): number {
  if (Number.isInteger(currentStepIndex)) {
    return Math.max(0, Math.min(3, currentStepIndex ?? 0))
  }
  if (progress >= 100) return 3
  if (progress >= 60) return 2
  if (progress >= 30) return 1
  return 0
}

function adaptSimulationStatusToViewModel(
  raw: SimulationStatusResponseDto,
): SimulationStatusViewModel {
  const status = normalizeStatus(raw.status)
  const fallbackProgress =
    status === "completed" ? 100 : status === "failed" ? 0 : 15
  const progress = clampProgress(raw.progress, fallbackProgress)

  return {
    status,
    progress: status === "completed" ? 100 : progress,
    activeStepIndex:
      status === "completed"
        ? 3
        : deriveActiveStepIndex(progress, raw.currentStepIndex),
    message: raw.message,
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

  async getSimulationStatus(simulationId: string) {
    const response = await httpClient.get<SimulationStatusResponseDto>(
      `/simulations/${simulationId}/status`,
    )
    return adaptSimulationStatusToViewModel(response)
  },
}
