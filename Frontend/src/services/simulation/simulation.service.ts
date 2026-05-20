import { requestJson } from "@/services/core/http-client"
import { SERVICE_CONFIG } from "@/services/core/service-config"
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

interface MockSimulationRecord {
  projectId: string
  title: string
  createdAt: string
  targetUrl?: string
}

const MOCK_SIMULATION_STORAGE_KEY = "swarm:simulation-mock"
const MOCK_SIMULATION_ID = "mock-simulation"
const MOCK_RUNNING_DURATION_MS = 6_000

function isSimulationMockEnabled() {
  return SERVICE_CONFIG.useSimulationMock
}

function readMockSimulationRecord(): MockSimulationRecord | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(MOCK_SIMULATION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockSimulationRecord>
    if (
      typeof parsed.projectId !== "string" ||
      typeof parsed.title !== "string" ||
      typeof parsed.createdAt !== "string"
    ) {
      return null
    }

    return {
      projectId: parsed.projectId,
      title: parsed.title,
      createdAt: parsed.createdAt,
      targetUrl: typeof parsed.targetUrl === "string" ? parsed.targetUrl : undefined,
    }
  } catch {
    return null
  }
}

function writeMockSimulationRecord(record: MockSimulationRecord) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(MOCK_SIMULATION_STORAGE_KEY, JSON.stringify(record))
}

function buildMockSimulationStatus(record: MockSimulationRecord): SimulationStatusResponseDto {
  const elapsedMs = Date.now() - new Date(record.createdAt).getTime()
  const progressRatio = Math.max(0, Math.min(1, elapsedMs / MOCK_RUNNING_DURATION_MS))
  const isCompleted = progressRatio >= 1
  const completed = Math.max(1, Math.min(5, Math.round(progressRatio * 5)))
  const total = 5

  return {
    id: record.projectId,
    status: isCompleted ? "completed" : "running",
    progress: isCompleted ? 100 : Math.max(12, Math.round(progressRatio * 92)),
    currentStep: isCompleted ? "결과 분석" : "시뮬레이션 실행",
    completed,
    total,
    failed: 0,
    createdAt: record.createdAt,
    updatedAt: new Date().toISOString(),
  }
}

function getDefaultMockSimulationRecord(): MockSimulationRecord {
  return {
    projectId: MOCK_SIMULATION_ID,
    title: "Mock Simulation",
    createdAt: new Date(Date.now() - MOCK_RUNNING_DURATION_MS).toISOString(),
    targetUrl: "https://example.com",
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
    if (isSimulationMockEnabled()) {
      void userId

      const record: MockSimulationRecord = {
        projectId: MOCK_SIMULATION_ID,
        title: input.title,
        createdAt: new Date().toISOString(),
        targetUrl: input.targetUrl,
      }

      writeMockSimulationRecord(record)

      return {
        projectId: record.projectId,
        title: record.title,
        status: "running",
        createdAt: record.createdAt,
      }
    }

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
    if (isSimulationMockEnabled()) {
      void userId

      const record = readMockSimulationRecord() ?? getDefaultMockSimulationRecord()
      const status = buildMockSimulationStatus(record)

      return [
        {
          simulationId: record.projectId,
          title: record.title,
          status: status.status,
          createdAt: record.createdAt,
          relativeCreatedAtLabel: record.createdAt,
          siteName: deriveSiteName(record.targetUrl),
        },
      ]
    }

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
    if (isSimulationMockEnabled()) {
      const record = readMockSimulationRecord() ?? getDefaultMockSimulationRecord()

      return buildMockSimulationStatus({
        ...record,
        projectId: simulationId || record.projectId,
      })
    }

    const raw = await requestJson<SimulationStatusApiDto>(
      `/api/simulations/${simulationId}/status`,
    )

    return mapSimulationStatusResponse(simulationId, raw)
  },
}
