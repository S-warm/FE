import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { demoHeatmapPoints, demoIssues, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"
import type { ApiHeatmapAgeGroup, ApiHeatmapErrorType } from "@/types/api/common/enums"

function toErrorType(errorType: string): ApiHeatmapErrorType {
  // errorType은 "접근성/터치 영역", "시각요소/가독성" 형식
  if (errorType.includes("접근성")) return "Console"
  if (errorType.includes("시각요소")) return "Timeout"
  if (errorType.includes("사용성")) return "Network"
  return "Network"
}

function toAgeBand(ageGroup: string): ApiHeatmapAgeGroup {
  if (ageGroup === "10대" || ageGroup === "20대" || ageGroup === "30대" || ageGroup === "40대" || ageGroup === "50대" || ageGroup === "60대" || ageGroup === "70대") {
    return ageGroup
  }
  return "all"
}

function findIssue(issueId: string) {
  return demoIssues.find((issue) => issue.issueId === issueId)
}

function buildBreakdown(errorType: ApiHeatmapErrorType) {
  if (errorType === "Timeout") return { timeout: 3, network: 0, console: 0 }
  if (errorType === "Network") return { timeout: 0, network: 2, console: 0 }
  return { timeout: 0, network: 0, console: 2 }
}

export const resultHeatmapMockService: ResultHeatmapService = {
  async getHeatmap(params) {
    await mockDelay()

    return {
      pages: demoResultPages.map((page, index) => {
        const filteredPoints = demoHeatmapPoints.filter((point) => {
          if (point.url !== page.url) return false
          if (params.ageGroup === "all") return true
          return point.ageBand === params.ageGroup
        })

        const start = params.page * params.size
        const pagedPoints = filteredPoints.slice(start, start + params.size)

        return {
          ...createResultPageSummary({
            simulationId: params.simulationId,
            order: index + 1,
            pageName: page.name,
            pageUrl: page.url,
            screenshotUrl: page.screenshotUrl,
            totalCount: filteredPoints.length,
            totalCountType: "errors",
            metaText: `${filteredPoints.length}건 오류`,
          }),
          currentAgeGroup: toAgeBand(params.ageGroup),
          points: pagedPoints.map((point) => {
            const linkedIssue = findIssue(point.issueId)
            const errorType = toErrorType(point.errorType)

            return {
              issueType: "ux" as const,
              issueId: point.issueId,
              x: point.x,
              y: point.y,
              count: point.count,
              severity: adaptIssueSeverity(point.severity),
              errorType,
              affectedUsersCount: linkedIssue?.affectedUsersCount ?? point.count,
              blockRate: Math.min(100, Math.round(((linkedIssue?.affectedUsersPercent ?? point.count) / 50) * 100)),
              repeatCount: Number((point.count / 4).toFixed(1)),
              description: linkedIssue?.description ?? point.errorType,
              ageBand: point.ageBand,
              errorBreakdown: buildBreakdown(errorType),
            }
          }),
          pagination: {
            totalCount: filteredPoints.length,
            currentPage: params.page,
            pageSize: params.size,
            hasMore: start + params.size < filteredPoints.length,
          },
        }
      }),
    }
  },
}

export const resultHeatmapHttpService: ResultHeatmapService = {
  async getHeatmap() {
    throw createNotImplementedServiceError("service://result-heatmap/http/get", "Heatmap HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
