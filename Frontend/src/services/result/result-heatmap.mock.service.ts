import { adaptHeatmapResponseToViewModel } from "@/adapters/result"
import { mockDelay } from "@/services/core/mock-delay"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"
import { heatmapPagesMock } from "@/mocks/result-heatmap.mock"
import type { ApiHeatmapAgeGroup, ApiHeatmapErrorType, ApiIssueSeverity } from "@/types/api/common/enums"
import type { SimulationHeatmapResponseDto } from "@/types/api/simulation/simulation-heatmap.response"

function toApiAgeGroup(ageGroup: string): ApiHeatmapAgeGroup {
  if (ageGroup === "10대" || ageGroup === "20대" || ageGroup === "30대" || ageGroup === "40대" || ageGroup === "50대" || ageGroup === "60대" || ageGroup === "70대") {
    return ageGroup
  }
  return "all"
}

function markerSeverityToApi(severity: "critical" | "warning"): ApiIssueSeverity {
  return severity === "critical" ? "CRITICAL" : "MEDIUM"
}

function createHeatmapMockResponse(ageGroup: string, page: number, size: number): SimulationHeatmapResponseDto {
  return {
    pages: heatmapPagesMock.map((heatmapPage, index) => {
      const errorPoints = heatmapPage.markers.map((marker, markerIndex) => {
        const defect = heatmapPage.defects[markerIndex]
        const count = marker.severity === "critical" ? 18 : 6
        const severity = markerSeverityToApi(marker.severity)
        const errorType: ApiHeatmapErrorType = marker.severity === "critical" ? "Timeout" : "Console"
        const isTimeout = errorType === "Timeout"
        return {
          x: Number((marker.x / 100).toFixed(2)),
          y: Number((marker.y / 100).toFixed(2)),
          count,
          severity,
          errorType,
          affectedUsersCount: defect?.impactedUsers ?? 0,
          blockRate: marker.severity === "critical" ? 100 : 55,
          repeatCount: marker.severity === "critical" ? 4.5 : 2.1,
          description: defect?.description ?? `${heatmapPage.name} 오류 집중 구간`,
          errorBreakdown: {
            timeout: isTimeout ? 2 : 0,
            network: 0,
            console: !isTimeout ? 1 : 0,
          },
          issueId: defect?.id ?? marker.id,
          ageBand: toApiAgeGroup(ageGroup),
        }
      })

      const start = page * size
      const pagedPoints = errorPoints.slice(start, start + size)

      return {
        order: index + 1,
        pageName: heatmapPage.name,
        pageUrl: `https://mock.swarm.local/${heatmapPage.id}`,
        screenshotUrl: heatmapPage.screenshotUrl,
        totalErrorCount: errorPoints.length,
        currentAgeGroup: toApiAgeGroup(ageGroup),
        errorPoints: pagedPoints,
        pagination: {
          totalCount: errorPoints.length,
          currentPage: page,
          pageSize: size,
          hasMore: start + size < errorPoints.length,
        },
      }
    }),
  }
}

export const resultHeatmapMockService: ResultHeatmapService = {
  async getHeatmap(params) {
    await mockDelay()
    return adaptHeatmapResponseToViewModel(
      params.simulationId,
      createHeatmapMockResponse(params.ageGroup, params.page, params.size)
    )
  },
}
