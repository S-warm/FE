import { adaptHeatmapResponseToViewModel } from "@/adapters/result/result-heatmap.adapter"
import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { demoHeatmapPoints, demoIssues, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"
import type { ApiHeatmapAgeGroup, ApiHeatmapErrorType } from "@/types/api/common/enums"
import type { SimulationHeatmapResponseDto } from "@/types/api/simulation/simulation-heatmap.response"
import type { ResultAgeFilter } from "@/types/view-model/common/result-meta"

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

function toResultAgeFilter(ageBand: string): ResultAgeFilter {
  if (ageBand === "10s") return "10대"
  if (ageBand === "20s") return "20대"
  if (ageBand === "30s") return "30대"
  if (ageBand === "40s") return "40대"
  if (ageBand === "50s") return "50대"
  if (ageBand === "60s") return "60대"
  if (ageBand === "70s") return "70대"
  return "all"
}

function toMockAgeGroup(ageGroup: ResultAgeFilter) {
  if (ageGroup === "10대") return "10s"
  if (ageGroup === "20대") return "20s"
  if (ageGroup === "30대") return "30s"
  if (ageGroup === "40대") return "40s"
  if (ageGroup === "50대") return "50s"
  if (ageGroup === "60대") return "60s"
  if (ageGroup === "70대") return "70s"
  return "all"
}

function findIssue(issueId: string) {
  return demoIssues.find((issue) => issue.issueId === issueId)
}

function getPageIssues(pageUrl: string) {
  return demoIssues.filter((issue) => issue.url === pageUrl)
}

function buildBreakdown(errorType: ApiHeatmapErrorType) {
  if (errorType === "Timeout") return { timeout: 3, network: 0, console: 0 }
  if (errorType === "Network") return { timeout: 0, network: 2, console: 0 }
  return { timeout: 0, network: 0, console: 2 }
}

function normalizeAxis(value: number) {
  if (!Number.isFinite(value)) return 0
  return value <= 1 ? Number((value * 100).toFixed(2)) : value
}

function toApiIssueSeverity(severity: string) {
  if (severity === "critical") return "CRITICAL" as const
  if (severity === "high") return "HIGH" as const
  if (severity === "medium") return "MEDIUM" as const
  return "LOW" as const
}

function buildFallbackPoint(params: {
  issueId: string
  ageGroup: ResultAgeFilter
  pointIndex: number
  description: string
  severity: ReturnType<typeof adaptIssueSeverity>
  affectedUsersCount: number
}) {
  const fallbackPositions = [
    { x: 24, y: 24 },
    { x: 42, y: 34 },
    { x: 58, y: 48 },
    { x: 72, y: 28 },
    { x: 64, y: 66 },
    { x: 34, y: 62 },
    { x: 78, y: 52 },
  ]
  const position = fallbackPositions[params.pointIndex % fallbackPositions.length] ?? fallbackPositions[0]

  return {
    issueType: "ux" as const,
    issueId: params.issueId,
    x: position.x,
    y: position.y,
    count: Math.min(10, Math.max(1, Math.ceil(params.affectedUsersCount / 40))),
    severity: params.severity,
    errorType: "Network" as const,
    affectedUsersCount: Math.min(10, Math.max(1, params.affectedUsersCount)),
    blockRate: 12,
    repeatCount: 1,
    description: `${params.description} · ${params.ageGroup} 페르소나`,
    ageBand: params.ageGroup,
    errorBreakdown: buildBreakdown("Network"),
  }
}

export const resultHeatmapMockService: ResultHeatmapService = {
  async getHeatmap(params) {
    await mockDelay()

    return {
      pages: demoResultPages.map((page, index) => {
        const filteredPoints = demoHeatmapPoints.filter((point) => {
          if (point.url !== page.url) return false
          if (params.ageGroup === "all") return true
          return point.ageBand === toMockAgeGroup(params.ageGroup)
        })
        const pageIssues = getPageIssues(page.url)
        const normalizedPoints = filteredPoints.map((point) => {
          const linkedIssue = findIssue(point.issueId)
          const errorType = toErrorType(point.errorType)

          return {
            issueType: "ux" as const,
            issueId: point.issueId,
            x: normalizeAxis(point.x),
            y: normalizeAxis(point.y),
            count: point.count,
            severity: adaptIssueSeverity(point.severity),
            errorType,
            affectedUsersCount: linkedIssue?.affectedUsersCount ?? point.count,
            blockRate: Math.min(100, Math.round(((linkedIssue?.affectedUsersPercent ?? point.count) / 50) * 100)),
            repeatCount: Number((point.count / 4).toFixed(1)),
            description: linkedIssue?.description ?? point.errorType,
            ageBand: toResultAgeFilter(point.ageBand),
            errorBreakdown: buildBreakdown(errorType),
          }
        })
        const fallbackPoints =
          params.ageGroup === "all" || normalizedPoints.length > 0
            ? []
            : pageIssues.slice(0, Math.min(3, pageIssues.length)).map((issue, issueIndex) =>
                buildFallbackPoint({
                  issueId: issue.issueId,
                  ageGroup: params.ageGroup,
                  pointIndex: issueIndex,
                  description: issue.description,
                  severity: adaptIssueSeverity(toApiIssueSeverity(issue.severity)),
                  affectedUsersCount: issue.affectedUsersCount,
                })
              )
        const mergedPoints = [...normalizedPoints, ...fallbackPoints]

        const start = params.page * params.size
        const pagedPoints = mergedPoints.slice(start, start + params.size)

        return {
          ...createResultPageSummary({
            simulationId: params.simulationId,
            order: index + 1,
            pageName: page.name,
            pageUrl: page.url,
            screenshotUrl: page.screenshotUrl,
            totalCount: mergedPoints.length,
            totalCountType: "errors",
            metaText: `${mergedPoints.length}건 오류`,
          }),
          currentAgeGroup: toAgeBand(params.ageGroup),
          points: pagedPoints,
          pagination: {
            totalCount: mergedPoints.length,
            currentPage: params.page,
            pageSize: params.size,
            hasMore: start + params.size < mergedPoints.length,
          },
        }
      }),
    }
  },
}

export const resultHeatmapHttpService: ResultHeatmapService = {
  async getHeatmap(params) {
    const raw = await requestJsonWithFallback<SimulationHeatmapResponseDto>(
      [
        `/api/simulations/${params.simulationId}/results/heatmap`,
        `/api/simulations/${params.simulationId}/heatmap`,
        `/simulations/${params.simulationId}/heatmap`,
      ],
      {
        query: {
          ageGroup: params.ageGroup,
          page: params.page,
          size: params.size,
        },
      }
    )

    return adaptHeatmapResponseToViewModel(params.simulationId, raw)
  },
}
