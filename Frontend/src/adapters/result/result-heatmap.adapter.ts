import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import type { SimulationHeatmapResponseDto } from "@/types/api/simulation/simulation-heatmap.response"
import type { ResultHeatmapViewModel } from "@/types/view-model/result/result-heatmap"

function normalizeCoordinate(value: number): number {
  if (!Number.isFinite(value)) return 0
  const normalized = value > 1 ? value / 100 : value
  return Math.max(0, Math.min(1, normalized))
}

export function adaptHeatmapResponseToViewModel(
  simulationId: string,
  raw: SimulationHeatmapResponseDto
): ResultHeatmapViewModel {
  return {
    pages: raw.pages.map((page) => ({
      ...createResultPageSummary({
        simulationId,
        order: page.order,
        pageName: page.pageName,
        pageUrl: page.pageUrl,
        screenshotUrl: page.screenshotUrl,
        totalCount: page.totalErrorCount,
        totalCountType: "errors",
        metaText: `${page.totalErrorCount}건 오류`,
      }),
      currentAgeGroup: page.currentAgeGroup,
      points: page.errorPoints.map((point) => ({
        issueType: "ux",
        issueId: point.issueId,
        x: normalizeCoordinate(point.x),
        y: normalizeCoordinate(point.y),
        count: point.count,
        severity: adaptIssueSeverity(point.severity),
        errorType: point.errorType,
        affectedUsersCount: point.affectedUsersCount,
        blockRate: point.blockRate,
        repeatCount: point.repeatCount,
        description: point.description,
        ageBand: point.ageBand,
        errorBreakdown: point.errorBreakdown,
      })),
      pagination: page.pagination,
    })),
  }
}
