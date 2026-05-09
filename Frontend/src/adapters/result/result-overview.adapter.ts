import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { ResultAgeBand } from "@/types/view-model/common/result-meta"
import type { ResultOverviewViewModel } from "@/types/view-model/result/result-overview"
import { createResultPageBase } from "@/adapters/result/result-page.adapter"

const RESULT_AGE_BANDS: ResultAgeBand[] = ["10대", "20대", "30대", "40대", "50대", "60대", "70대"]

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

export function adaptOverviewResponseToViewModel(
  simulationId: string,
  raw: SimulationOverviewResponseDto
): ResultOverviewViewModel {
  const pages = raw.funnelPanels.map((panel) =>
    createResultPageBase({
      simulationId,
      order: panel.order,
      pageName: panel.pageName,
      pageUrl: panel.pageUrl,
    })
  )

  const totalsByAge = RESULT_AGE_BANDS.map((ageBand) => {
    const aggregated = raw.funnelPanels.reduce(
      (acc, panel) => {
        const stats = panel.agentsByAge[ageBand]
        acc.entered += stats.entered
        acc.passed += stats.passed
        acc.dropOff += stats.dropOff
        acc.avgTimeSeconds += panel.avgTimeSeconds
        return acc
      },
      { entered: 0, passed: 0, dropOff: 0, avgTimeSeconds: 0 }
    )

    const pageCount = raw.funnelPanels.length || 1
    const failureRate = aggregated.entered > 0 ? Number((((aggregated.entered - aggregated.passed) / aggregated.entered) * 100).toFixed(1)) : 0
    const dropOffRate = aggregated.entered > 0 ? Number(((aggregated.dropOff / aggregated.entered) * 100).toFixed(1)) : 0

    return {
      ageBand,
      successRate: aggregated.entered > 0 ? Number(((aggregated.passed / aggregated.entered) * 100).toFixed(1)) : 0,
      failureRate,
      dropOffRate,
      avgDurationMinutes: Number((aggregated.avgTimeSeconds / pageCount / 60).toFixed(1)),
      avgActions: null,
    }
  })

  return {
    summary: {
      taskSuccessRateLabel: `${raw.summary.taskSuccessRate}%`,
      totalAgentsLabel: `${formatNumberLabel(raw.summary.totalAgents)}명`,
      avgCompletionTimeLabel: formatDurationLabel(raw.summary.avgCompletionSeconds),
      dropOffAgentsLabel: `${formatNumberLabel(raw.summary.dropOffAgents)}명`,
    },
    pages,
    ageStats: totalsByAge,
  }
}
