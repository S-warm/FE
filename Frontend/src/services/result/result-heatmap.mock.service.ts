import { adaptHeatmapResponseToViewModel } from "@/adapters/result"
import { heatmapPagesMock } from "@/mocks/result-heatmap.mock"
import { mockDelay } from "@/services/core/mock-delay"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"
import type { ApiHeatmapAgeGroup, ApiHeatmapErrorType, ApiIssueSeverity } from "@/types/api/common/enums"
import type { SimulationHeatmapResponseDto } from "@/types/api/simulation/simulation-heatmap.response"

function toApiAgeGroup(ageGroup: string): ApiHeatmapAgeGroup {
  if (ageGroup === "10대" || ageGroup === "20대" || ageGroup === "30대" || ageGroup === "40대" || ageGroup === "50대" || ageGroup === "60대" || ageGroup === "70대") {
    return ageGroup
  }
  return "all"
}

function markerSeverityToApi(severity: "critical" | "warning"): ApiIssueSeverity {
  return severity === "critical" ? "CRITICAL" : "HIGH"
}

function parseMarkerMetadata(markerId: string) {
  const [issueId, ageBand, count, blockRate, repeatCount] = markerId.split("|")
  return {
    issueId,
    ageBand: toApiAgeGroup(ageBand ?? "all"),
    count: Number(count ?? 0),
    blockRate: Number(blockRate ?? 0),
    repeatCount: Number(repeatCount ?? 0),
  }
}

function toErrorType(severity: "critical" | "warning"): ApiHeatmapErrorType {
  return severity === "critical" ? "Timeout" : "Console"
}

function createHeatmapMockResponse(ageGroup: string, page: number, size: number): SimulationHeatmapResponseDto {
  return {
    pages: heatmapPagesMock.map((heatmapPage, index) => {
      const errorPoints = heatmapPage.markers.map((marker, markerIndex) => {
        const defect = heatmapPage.defects[markerIndex]
        const metadata = parseMarkerMetadata(marker.id)
        const severity = markerSeverityToApi(marker.severity)
        const errorType = toErrorType(marker.severity)
        const isTimeout = errorType === "Timeout"

        return {
          x: Number((marker.x / 100).toFixed(3)),
          y: Number((marker.y / 100).toFixed(3)),
          count: Math.max(5, Math.min(50, metadata.count || Number(defect?.code ?? 0) || 6)),
          severity,
          errorType,
          affectedUsersCount: defect?.impactedUsers ?? 0,
          blockRate: metadata.blockRate || (marker.severity === "critical" ? 80 : 48),
          repeatCount: metadata.repeatCount || (marker.severity === "critical" ? 3.2 : 2.1),
          description: defect?.description ?? `${heatmapPage.name} 오류 클러스터`,
          errorBreakdown: {
            timeout: isTimeout ? 2 : 0,
            network: marker.severity === "critical" ? 1 : 0,
            console: !isTimeout ? 1 : 0,
          },
          issueId: metadata.issueId || defect?.id || marker.id,
          ageBand: metadata.ageBand || toApiAgeGroup(ageGroup),
        }
      })

      const resolvedPoints =
        ageGroup === "all"
          ? errorPoints
          : errorPoints.filter((point) => point.ageBand === toApiAgeGroup(ageGroup))

      const start = page * size
      const pagedPoints = resolvedPoints.slice(start, start + size)

      return {
        order: index + 1,
        pageName: heatmapPage.name,
        pageUrl: `https://mock.swarm.local/${heatmapPage.id}`,
        screenshotUrl: heatmapPage.screenshotUrl,
        totalErrorCount: resolvedPoints.length,
        currentAgeGroup: toApiAgeGroup(ageGroup),
        errorPoints: pagedPoints,
        pagination: {
          totalCount: resolvedPoints.length,
          currentPage: page,
          pageSize: size,
          hasMore: start + size < resolvedPoints.length,
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
