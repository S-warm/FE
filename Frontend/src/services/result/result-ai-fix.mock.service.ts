import { adaptAiFixResponseToViewModel } from "@/adapters/result/result-ai-fix.adapter"
import { ApiServiceError } from "@/services/core/api-service-error"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultAiFixService } from "@/services/result/result-ai-fix.service"
import type {
  SimulationAiFixApiResponseDto,
  SimulationAiFixBusinessResponseDto,
} from "@/types/api/simulation/simulation-ai-fix.response"

function buildPreviewResponse(): SimulationAiFixBusinessResponseDto {
  return {
    url: "https://www.dbpia.co.kr/search/topSearch",
    fixes: [
      {
        issue_title: "검색 결과 필터 버튼 인식 실패",
        selector: ".search-filter-wrap .filter-btn",
        before:
          ".search-filter-wrap .filter-btn { font-size: 12px; padding: 4px 8px; color: #999; }",
        after:
          ".search-filter-wrap .filter-btn { font-size: 16px; padding: 10px 16px; color: #222; font-weight: bold; border: 2px solid #0057b8; }",
        description:
          "필터 버튼의 텍스트 크기와 대비를 높이고 패딩을 확대하여 고령 사용자도 쉽게 인식하고 클릭할 수 있도록 변경했습니다.",
        impact:
          "70대 페르소나의 필터 인식 실패율이 감소하고 탐색 성공률이 향상될 것으로 예상됩니다.",
        severity: "HIGH",
        affectedUsersCount: 18,
      },
      {
        issue_title: "논문 다운로드 버튼 클릭 영역 협소",
        selector: ".article-download-btn",
        before:
          ".article-download-btn { width: 80px; height: 28px; font-size: 12px; }",
        after:
          ".article-download-btn { width: 120px; height: 44px; font-size: 15px; min-width: 44px; min-height: 44px; }",
        description:
          "다운로드 버튼의 클릭 영역을 WCAG 권장 최소 크기(44×44px)로 확대하여 오클릭 발생을 줄였습니다.",
        impact:
          "50대·70대 페르소나의 다운로드 버튼 클릭 성공률이 향상될 것으로 예상됩니다.",
        severity: "MEDIUM",
        affectedUsersCount: 9,
      },
    ],
  }
}

function hasUsableAiFixPayload(raw: SimulationAiFixApiResponseDto) {
  if ("url" in raw) {
    return Array.isArray(raw.fixes) && raw.fixes.length > 0
  }

  return Array.isArray(raw.pages) && raw.pages.some((page) => page.fixes.length > 0)
}

const aiFixPreviewResponse = buildPreviewResponse()

export const resultAiFixMockService: ResultAiFixService = {
  async getAiFix(simulationId) {
    await mockDelay()
    return adaptAiFixResponseToViewModel(simulationId, aiFixPreviewResponse)
  },
}

export const resultAiFixHttpService: ResultAiFixService = {
  async getAiFix(simulationId) {
    if (SERVICE_CONFIG.useAiFixPreviewData) {
      return adaptAiFixResponseToViewModel(simulationId, aiFixPreviewResponse)
    }

    try {
      const raw = await requestJsonWithFallback<SimulationAiFixApiResponseDto>([
        `/api/simulations/${simulationId}/ai-fix`,
        `/api/simulations/${simulationId}/results/ai-fix`,
        `/api/simulations/${simulationId}/ai`,
        `/simulations/${simulationId}/ai-fix`,
      ])

      if (!hasUsableAiFixPayload(raw)) {
        return adaptAiFixResponseToViewModel(simulationId, aiFixPreviewResponse)
      }

      return adaptAiFixResponseToViewModel(simulationId, raw)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return adaptAiFixResponseToViewModel(simulationId, aiFixPreviewResponse)
      }

      throw error
    }
  },
}
