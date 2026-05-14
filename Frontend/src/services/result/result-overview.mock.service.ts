import { adaptOverviewResponseToViewModel } from "@/adapters/result/result-overview.adapter"
import { createResultPageBase } from "@/adapters/result/result-page.adapter"
import { demoOverview, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultOverviewService } from "@/services/result/result-overview.service"
import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { ResultAgeBand } from "@/types/view-model/common/result-meta"

function formatNumberLabel(value: number) {
  return value.toLocaleString("ko-KR")
}

function formatDurationLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes <= 0) return `${remainingSeconds}초`
  if (remainingSeconds <= 0) return `${minutes}분`
  return `${minutes}분 ${remainingSeconds}초`
}

export const resultOverviewMockService: ResultOverviewService = {
  async getOverview(simulationId) {
    await mockDelay()

    return {
      summary: {
        taskSuccessRateLabel: `${demoOverview.summary.successRate}%`,
        totalAgentsLabel: `${formatNumberLabel(demoOverview.summary.totalSessions)}명`,
        avgCompletionTimeLabel: formatDurationLabel(demoOverview.summary.avgDurationSeconds),
        dropOffAgentsLabel: `${formatNumberLabel(demoOverview.summary.totalSessions - demoOverview.summary.successCount)}명`,
      },
      pages: demoResultPages.map((page, index) =>
        createResultPageBase({
          simulationId,
          order: index + 1,
          pageName: page.name,
          pageUrl: page.url,
          screenshotUrl: page.screenshotUrl,
        })
      ),
      ageStats: demoOverview.ageStats.map((item) => ({
        ageBand: item.ageBand as ResultAgeBand,
        successRate: item.successRate,
        failureRate: item.failureRate,
        dropOffRate: item.failureRate,
        avgDurationMinutes: item.avgDurationMinutes,
        avgActions: item.avgActions,
      })),
    }
  },
}

export const resultOverviewHttpService: ResultOverviewService = {
  async getOverview(simulationId) {
    const raw = await requestJsonWithFallback<SimulationOverviewResponseDto>([
      `/api/simulations/${simulationId}/results/overview`,
      `/api/simulations/${simulationId}/overview`,
      `/simulations/${simulationId}/overview`,
    ])

    return adaptOverviewResponseToViewModel(simulationId, raw)
  },
}
