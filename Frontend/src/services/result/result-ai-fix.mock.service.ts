import { adaptAiFixResponseToViewModel } from "@/adapters/result"
import { mockDelay } from "@/services/core/mock-delay"
import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultAiFixService } from "@/services/result/result-ai-fix.service"
import { aiFixPagesMock } from "@/mocks/result-ai-fix.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import type { ApiIssueSeverity } from "@/types/api/common/enums"
import type { SimulationAiFixResponseDto } from "@/types/api/simulation/simulation-ai-fix.response"

function mapAiFixSeverity(severity: "high" | "medium" | "low"): ApiIssueSeverity {
  if (severity === "high") return "HIGH"
  if (severity === "medium") return "MEDIUM"
  return "LOW"
}

function createAiFixMockResponse(): SimulationAiFixResponseDto {
  return {
    pages: aiFixPagesMock.map((page, index) => {
      const pageMeta = resultPagesMock.find((item) => item.id === page.id)
      return {
        order: index + 1,
        pageName: page.name,
        pageUrl: `https://mock.swarm.local/${page.id}`,
        screenshotUrl: pageMeta?.screenshotUrl ?? "",
        totalFixCount: page.fixes.length,
        fixes: page.fixes.map((fix) => ({
          issueId: fix.id,
          title: fix.title,
          severity: mapAiFixSeverity(fix.severity),
          affectedUsersCount: fix.impactedUsers.count,
          beforeCode: fix.beforeCode,
          afterCode: fix.afterCode,
          impactDescription: fix.impactSummary,
          changeDescription: fix.changeSummaryBody,
        })),
      }
    }),
  }
}

export const resultAiFixMockService: ResultAiFixService = {
  async getAiFix(simulationId) {
    await mockDelay()
    return adaptAiFixResponseToViewModel(simulationId, createAiFixMockResponse())
  },
}

export const resultAiFixHttpService: ResultAiFixService = {
  async getAiFix() {
    throw createNotImplementedServiceError("service://result-ai-fix/http/get", "AI Fix HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
