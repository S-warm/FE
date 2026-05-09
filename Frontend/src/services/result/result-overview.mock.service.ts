import { adaptOverviewResponseToViewModel } from "@/adapters/result"
import { mockDelay } from "@/services/core/mock-delay"
import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultOverviewService } from "@/services/result/result-overview.service"
import { ageOverviewData } from "@/mocks/data-visualization.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import type {
  SimulationOverviewAgeBand,
  SimulationOverviewResponseDto,
} from "@/types/api/simulation/simulation-overview.response"

const OVERVIEW_AGE_BANDS: SimulationOverviewAgeBand[] = ["10대", "20대", "30대", "40대", "50대", "60대", "70대"]

function findAgeDatum(ageBand: SimulationOverviewAgeBand) {
  return ageOverviewData.find((item) => item.label === ageBand)
}

function createOverviewMockResponse(): SimulationOverviewResponseDto {
  return {
    summary: {
      taskSuccessRate: 28,
      totalAgents: 1000,
      avgCompletionSeconds: 252,
      dropOffAgents: 720,
    },
    funnelPanels: resultPagesMock.map((page, index) => ({
      order: index + 1,
      pageName: page.name,
      pageUrl: `https://mock.swarm.local/${page.id}`,
      totalEntered: 1000,
      totalPassed: 280,
      panelSuccessRate: 28,
      avgTimeSeconds: 63,
      agentsByAge: Object.fromEntries(
        OVERVIEW_AGE_BANDS.map((ageBand) => {
          const datum = findAgeDatum(ageBand)
          const entered = datum ? 100 : 0
          const passed = datum ? Math.round((datum.successRate / 100) * entered) : 0
          const dropOff = Math.max(0, entered - passed)
          return [
            ageBand,
            {
              entered,
              passed,
              dropOff,
              successRate: datum?.successRate ?? 0,
            },
          ]
        })
      ) as SimulationOverviewResponseDto["funnelPanels"][number]["agentsByAge"],
    })),
  }
}

export const resultOverviewMockService: ResultOverviewService = {
  async getOverview(simulationId) {
    await mockDelay()
    return adaptOverviewResponseToViewModel(simulationId, createOverviewMockResponse())
  },
}

export const resultOverviewHttpService: ResultOverviewService = {
  async getOverview() {
    throw createNotImplementedServiceError("service://result-overview/http/get", "Overview HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
