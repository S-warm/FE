import { adaptOverviewResponseToViewModel } from "@/adapters/result"
import { ageOverviewData } from "@/mocks/data-visualization.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import { mockDelay } from "@/services/core/mock-delay"
import type { ResultOverviewService } from "@/services/result/result-overview.service"
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
    const viewModel = adaptOverviewResponseToViewModel(simulationId, createOverviewMockResponse())

    return {
      ...viewModel,
      ageStats: viewModel.ageStats.map((item) => {
        const datum = findAgeDatum(item.ageBand)
        return {
          ...item,
          avgDurationMinutes: datum?.avgDurationMinutes ?? item.avgDurationMinutes,
          avgActions: datum?.avgActions ?? item.avgActions,
        }
      }),
    }
  },
}
