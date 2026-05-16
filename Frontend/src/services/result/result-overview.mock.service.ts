import { adaptOverviewResponseToViewModel } from "@/adapters/result/result-overview.adapter"
import { createResultPageBase } from "@/adapters/result/result-page.adapter"
import { demoOverview, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { ApiServiceError } from "@/services/core/api-service-error"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJson } from "@/services/core/http-client"
import type { ResultOverviewService } from "@/services/result/result-overview.service"
import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { ResultAgeBand } from "@/types/view-model/common/result-meta"

const overviewPreviewResponse: SimulationOverviewResponseDto = {
  summary: {
    success_rate: 0.7111,
    total_sessions: 900,
    avg_duration_ms: 47200,
    success_count: 640,
  },
  overview: [
    {
      age_group: "20s",
      total_sessions: 300,
      success_count: 252,
      success_rate: 0.84,
      fail_rate: 0.16,
      avg_duration_ms: 31500,
      avg_actions: 8.4,
      avg_declare_failure: 0.31,
    },
    {
      age_group: "50s",
      total_sessions: 300,
      success_count: 219,
      success_rate: 0.73,
      fail_rate: 0.27,
      avg_duration_ms: 51200,
      avg_actions: 12.7,
      avg_declare_failure: 0.84,
    },
    {
      age_group: "70s",
      total_sessions: 300,
      success_count: 169,
      success_rate: 0.5633,
      fail_rate: 0.4367,
      avg_duration_ms: 58900,
      avg_actions: 17.2,
      avg_declare_failure: 1.62,
    },
  ],
}

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
        avgDeclareFailure: null,
        totalSessions: undefined,
        successCount: undefined,
      })),
    }
  },
}

export const resultOverviewHttpService: ResultOverviewService = {
  async getOverview(simulationId) {
    if (SERVICE_CONFIG.useOverviewPreviewData) {
      return adaptOverviewResponseToViewModel(simulationId, overviewPreviewResponse)
    }

    try {
      const raw = await requestJson<SimulationOverviewResponseDto>(
        `/api/simulations/${simulationId}/overview`
      )

      return adaptOverviewResponseToViewModel(simulationId, raw)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return adaptOverviewResponseToViewModel(simulationId, overviewPreviewResponse)
      }

      throw error
    }
  },
}
