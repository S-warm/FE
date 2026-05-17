import { adaptHeatmapResponseToViewModel } from "@/adapters/result/result-heatmap.adapter"
import { searchHeatmapPointsMock } from "@/mocks/result-search.mock"
import { demoHeatmapPoints } from "@/mocks/uxswarm-demo.mock"
import { ApiServiceError } from "@/services/core/api-service-error"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"
import type { GetResultHeatmapParams } from "@/services/result/result.types"
import type {
  SimulationHeatmapApiResponseDto,
  SimulationHeatmapBusinessResponseDto,
} from "@/types/api/simulation/simulation-heatmap.response"

function hasUsableHeatmapPayload(raw: SimulationHeatmapApiResponseDto) {
  if ("errorPoints" in raw) {
    return Array.isArray(raw.errorPoints) && raw.errorPoints.length > 0
  }

  return (
    Array.isArray(raw.pages) &&
    raw.pages.some((page) => Array.isArray(page.errorPoints) && page.errorPoints.length > 0)
  )
}

function buildPreviewResponse(): SimulationHeatmapBusinessResponseDto {
  const previewPoints: SimulationHeatmapBusinessResponseDto["errorPoints"] = [
    {
      issueId: "issue_0",
      url: "https://www.dbpia.co.kr/search/topSearch",
      x: 0.124,
      y: 0.213,
      ageBand: "70s",
      count: 11,
      severity: "HIGH",
      errorType: "사용성/시인성 부족",
    },
    {
      issueId: "issue_0",
      url: "https://www.dbpia.co.kr/search/topSearch",
      x: 0.302,
      y: 0.198,
      ageBand: "70s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/시인성 부족",
    },
    {
      issueId: "issue_2",
      url: "https://www.dbpia.co.kr/search/topSearch",
      x: 0.548,
      y: 0.164,
      ageBand: "50s",
      count: 8,
      severity: "HIGH",
      errorType: "시각요소/정렬 버튼 대비 부족",
    },
    {
      issueId: "issue_3",
      url: "https://www.dbpia.co.kr/search/topSearch",
      x: 0.194,
      y: 0.472,
      ageBand: "30s",
      count: 4,
      severity: "LOW",
      errorType: "접근성/필터 상태 전달 부족",
    },
    {
      issueId: "issue_1",
      url: "https://www.dbpia.co.kr/journal/articleDetail",
      x: 0.781,
      y: 0.442,
      ageBand: "50s",
      count: 4,
      severity: "MEDIUM",
      errorType: "접근성/클릭 영역 불명확",
    },
    {
      issueId: "issue_1",
      url: "https://www.dbpia.co.kr/journal/articleDetail",
      x: 0.779,
      y: 0.451,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/클릭 영역 불명확",
    },
    {
      issueId: "issue_4",
      url: "https://www.dbpia.co.kr/journal/articleDetail",
      x: 0.694,
      y: 0.596,
      ageBand: "70s",
      count: 9,
      severity: "HIGH",
      errorType: "사용성/다운로드 CTA 탐색 지연",
    },
  ]

  const demoPoints = demoHeatmapPoints.slice(0, 4).map((point) => ({
    issueId: point.issueId,
    url: point.url,
    x: point.x,
    y: point.y,
    ageBand: point.ageBand,
    count: point.count,
    severity: point.severity,
    errorType: point.errorType,
  }))

  const searchPoints = searchHeatmapPointsMock.slice(0, 3).map((point) => ({
    issueId: point.issueId,
    url: point.url,
    x: point.x,
    y: point.y,
    ageBand: point.ageBand,
    count: point.count,
    severity: point.severity,
    errorType: point.errorType,
  }))

  return {
    errorPoints: [...previewPoints, ...demoPoints, ...searchPoints],
  }
}

const heatmapPreviewResponse = buildPreviewResponse()

export const resultHeatmapMockService: ResultHeatmapService = {
  async getHeatmap(params) {
    await mockDelay()
    return adaptHeatmapResponseToViewModel(
      params.simulationId,
      heatmapPreviewResponse,
      params
    )
  },
}

async function requestHeatmap(params: GetResultHeatmapParams) {
  return requestJsonWithFallback<SimulationHeatmapApiResponseDto>([
    `/api/simulations/${params.simulationId}/heatmap`,
    `/api/simulations/${params.simulationId}/results/heatmap`,
    `/simulations/${params.simulationId}/heatmap`,
  ])
}

export const resultHeatmapHttpService: ResultHeatmapService = {
  async getHeatmap(params) {
    if (SERVICE_CONFIG.useHeatmapPreviewData) {
      return adaptHeatmapResponseToViewModel(
        params.simulationId,
        heatmapPreviewResponse,
        params
      )
    }

    try {
      const raw = await requestHeatmap(params)

      if (!hasUsableHeatmapPayload(raw)) {
        return adaptHeatmapResponseToViewModel(
          params.simulationId,
          heatmapPreviewResponse,
          params
        )
      }

      return adaptHeatmapResponseToViewModel(params.simulationId, raw, params)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return adaptHeatmapResponseToViewModel(
          params.simulationId,
          heatmapPreviewResponse,
          params
        )
      }

      throw error
    }
  },
}
