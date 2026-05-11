import { createResultPageBase } from "@/adapters/result/result-page.adapter"
import { demoOverview, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultOverviewService } from "@/services/result/result-overview.service"

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
        ageBand: item.ageBand,
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
  async getOverview() {
    throw createNotImplementedServiceError("service://result-overview/http/get", "Overview HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
