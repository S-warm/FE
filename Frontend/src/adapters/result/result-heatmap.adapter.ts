import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
import type { GetResultHeatmapParams } from "@/services/result/result.types"
import type {
  SimulationHeatmapApiResponseDto,
  SimulationHeatmapBusinessPointDto,
  SimulationHeatmapPageDto,
} from "@/types/api/simulation/simulation-heatmap.response"
import type { ResultAgeBand, ResultAgeFilter } from "@/types/view-model/common/result-meta"
import type {
  ResultHeatmapCoordinateMode,
  ResultHeatmapViewModel,
} from "@/types/view-model/result/result-heatmap"

function normalizeAxis(value: number) {
  if (!Number.isFinite(value)) return 0
  return Number(value.toFixed(4))
}

function detectCoordinateMode(
  points: Array<{ x: number; y: number }>,
): ResultHeatmapCoordinateMode {
  if (!points.length) {
    return "pixel"
  }

  const maxX = Math.max(...points.map((point) => point.x))
  const maxY = Math.max(...points.map((point) => point.y))

  if (maxX <= 1 && maxY <= 1) {
    return "ratio"
  }

  if (maxX <= 100 && maxY <= 100) {
    return "percent"
  }

  if (maxX <= 1000 && maxY <= 1000) {
    return "pixel-scaled-thousand"
  }

  return "pixel"
}

function normalizeAgeBand(ageBand: string): ResultAgeFilter {
  if (ageBand === "10s" || ageBand === "10대") return "10대"
  if (ageBand === "20s" || ageBand === "20대") return "20대"
  if (ageBand === "30s" || ageBand === "30대") return "30대"
  if (ageBand === "40s" || ageBand === "40대") return "40대"
  if (ageBand === "50s" || ageBand === "50대") return "50대"
  if (ageBand === "60s" || ageBand === "60대") return "60대"
  if (ageBand === "70s" || ageBand === "70대") return "70대"
  return "all"
}

function resolveScreenshotUrl(url: string) {
  if (url.includes("/search")) return getResultPageScreenshotUrl("search")
  if (url.includes("/articleDetail") || url.includes("/journal")) {
    return getResultPageScreenshotUrl("product")
  }
  if (url.includes("/login")) return getResultPageScreenshotUrl("login")
  if (url.includes("/signup")) return getResultPageScreenshotUrl("signup")
  return getResultPageScreenshotUrl()
}

function resolvePageName(url: string) {
  if (url.includes("/search")) return "검색 결과"
  if (url.includes("/articleDetail")) return "논문 상세"
  if (url.includes("/journal")) return "저널 상세"
  if (url.includes("/login")) return "로그인"
  if (url.includes("/signup")) return "회원가입"
  return "상세 페이지"
}

function buildErrorBreakdown(label: string, count: number) {
  const normalized = label.toLowerCase()

  if (normalized.includes("사용성")) {
    return {
      timeout: Math.max(0, Math.round(count * 0.2)),
      network: Math.max(1, Math.round(count * 0.5)),
      console: Math.max(0, count - Math.max(1, Math.round(count * 0.5)) - Math.max(0, Math.round(count * 0.2))),
    }
  }

  if (normalized.includes("접근성")) {
    return {
      timeout: Math.max(0, Math.round(count * 0.1)),
      network: Math.max(0, Math.round(count * 0.25)),
      console: Math.max(1, count - Math.max(0, Math.round(count * 0.1)) - Math.max(0, Math.round(count * 0.25))),
    }
  }

  return {
    timeout: Math.max(1, Math.round(count * 0.4)),
    network: Math.max(0, Math.round(count * 0.3)),
    console: Math.max(0, count - Math.max(1, Math.round(count * 0.4)) - Math.max(0, Math.round(count * 0.3))),
  }
}

function buildPointDescription(point: SimulationHeatmapBusinessPointDto) {
  const ageBand = normalizeAgeBand(point.ageBand)
  const ageLabel = ageBand === "all" ? "전체" : ageBand
  return `${ageLabel} 페르소나에서 ${point.errorType} 이슈가 ${point.count}회 관측되었습니다.`
}

function resolveCurrentAgeGroup(ageGroups: ResultAgeBand[]): ResultAgeFilter {
  return ageGroups.length === 1 ? ageGroups[0] : "all"
}

function toBusinessViewModel(
  simulationId: string,
  raw: Extract<SimulationHeatmapApiResponseDto, { errorPoints: SimulationHeatmapBusinessPointDto[] }>,
  params: GetResultHeatmapParams
): ResultHeatmapViewModel {
  const selectedAgeGroups = new Set(params.ageGroups)
  const filteredByAge =
    selectedAgeGroups.size === 0 || selectedAgeGroups.size === 7
      ? raw.errorPoints
      : raw.errorPoints.filter(
          (point) => {
            const normalizedAgeBand = normalizeAgeBand(point.ageBand)
            return normalizedAgeBand !== "all" && selectedAgeGroups.has(normalizedAgeBand)
          }
        )

  const pointsByUrl = filteredByAge.reduce<Map<string, SimulationHeatmapBusinessPointDto[]>>(
    (acc, point) => {
      const bucket = acc.get(point.url) ?? []
      bucket.push(point)
      acc.set(point.url, bucket)
      return acc
    },
    new Map()
  )

  return {
    pages: Array.from(pointsByUrl.entries()).map(([url, points], index) => {
      const start = params.page * params.size
      const pagedPoints = points.slice(start, start + params.size)
      const totalCount = points.reduce((sum, point) => sum + point.count, 0)
      const maxCount = Math.max(...points.map((point) => point.count), 1)

      return {
      ...createResultPageSummary({
        simulationId,
        order: index + 1,
        pageName: resolvePageName(url),
        pageUrl: url,
          screenshotUrl: resolveScreenshotUrl(url),
          totalCount,
        totalCountType: "errors",
        metaText: `${points.length}개 포인트`,
      }),
      currentAgeGroup: resolveCurrentAgeGroup(params.ageGroups),
      selectedAgeBands: params.ageGroups,
      coordinateMode: detectCoordinateMode(pagedPoints),
      points: pagedPoints.map((point) => ({
        markerId: `${url}:${point.issueId}:${point.x}:${point.y}:${point.ageBand}`,
        issueType: "ux" as const,
        issueId: point.issueId,
          x: normalizeAxis(point.x),
          y: normalizeAxis(point.y),
          count: point.count,
          severity: adaptIssueSeverity(point.severity),
          errorType: point.errorType,
          affectedUsersCount: point.count,
          blockRate: Number(((point.count / maxCount) * 100).toFixed(1)),
          repeatCount: Number((point.count / Math.max(1, point.count / 2)).toFixed(1)),
          description: buildPointDescription(point),
          ageBand: normalizeAgeBand(point.ageBand),
          errorBreakdown: buildErrorBreakdown(point.errorType, point.count),
        })),
        pagination: {
          totalCount: points.length,
          currentPage: params.page,
          pageSize: params.size,
          hasMore: start + params.size < points.length,
        },
      }
    }),
  }
}

function toLegacyViewModel(
  simulationId: string,
  raw: Extract<SimulationHeatmapApiResponseDto, { pages: SimulationHeatmapPageDto[] }>
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
      currentAgeGroup: page.currentAgeGroup ?? "all",
      selectedAgeBands:
        page.currentAgeGroup && page.currentAgeGroup !== "all"
          ? [page.currentAgeGroup]
          : ["10대", "20대", "30대", "40대", "50대", "60대", "70대"],
      coordinateMode: detectCoordinateMode(page.errorPoints ?? []),
      points: (page.errorPoints ?? []).map((point) => {
        const count = point.count ?? 0
        const errorType = point.errorType ?? ""
        const ageBand = normalizeAgeBand(point.ageBand ?? "")
        const maxCount = Math.max(...(page.errorPoints ?? []).map((p) => p.count ?? 0), 1)
        return {
          markerId: `${page.pageUrl}:${point.issueId}:${point.x}:${point.y}:${point.ageBand ?? ""}`,
          issueType: "ux" as const,
          issueId: point.issueId,
          x: normalizeAxis(point.x),
          y: normalizeAxis(point.y),
          count,
          severity: adaptIssueSeverity(point.severity),
          errorType,
          affectedUsersCount: point.affectedUsersCount ?? count,
          blockRate: point.blockRate ?? Number(((count / maxCount) * 100).toFixed(1)),
          repeatCount: point.repeatCount ?? Number((count / Math.max(1, count / 2)).toFixed(1)),
          description: point.description ?? `${ageBand === "all" ? "전체" : ageBand} 페르소나에서 ${errorType} 이슈가 ${count}회 관측되었습니다.`,
          ageBand,
          errorBreakdown: point.errorBreakdown ?? buildErrorBreakdown(errorType, count),
        }
      }),
      pagination: page.pagination ?? {
        totalCount: page.totalErrorCount,
        currentPage: 0,
        pageSize: (page.errorPoints ?? []).length,
        hasMore: false,
      },
    })),
  }
}

export function adaptHeatmapResponseToViewModel(
  simulationId: string,
  raw: SimulationHeatmapApiResponseDto,
  params: GetResultHeatmapParams
): ResultHeatmapViewModel {
  if ("errorPoints" in raw && Array.isArray(raw.errorPoints)) {
    return toBusinessViewModel(simulationId, raw, params)
  }

  if ("pages" in raw && Array.isArray(raw.pages)) {
    return toLegacyViewModel(simulationId, raw)
  }

  return { pages: [] }
}
