import { adaptAiFixResponseToViewModel } from "@/adapters/result/result-ai-fix.adapter"
import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { demoFixesByUrl, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultAiFixService } from "@/services/result/result-ai-fix.service"
import type { ApiIssueSeverity } from "@/types/api/common/enums"
import type { SimulationAiFixResponseDto } from "@/types/api/simulation/simulation-ai-fix.response"

function toApiIssueSeverity(severity: string): ApiIssueSeverity {
  if (severity === "critical") return "CRITICAL"
  if (severity === "high") return "HIGH"
  if (severity === "medium") return "MEDIUM"
  return "LOW"
}

export const resultAiFixMockService: ResultAiFixService = {
  async getAiFix(simulationId) {
    await mockDelay()

    return {
      pages: demoResultPages.map((page, index) => {
        const fixes = demoFixesByUrl[page.url] ?? []

        return {
          ...createResultPageSummary({
            simulationId,
            order: index + 1,
            pageName: page.name,
            pageUrl: page.url,
            screenshotUrl: page.screenshotUrl,
            totalCount: fixes.length,
            totalCountType: "fixes",
            metaText: `${fixes.length}건 수정안`,
          }),
          fixes: fixes.map((fix, fixIndex) => ({
            issueType: "ux" as const,
            issueId: `fix-${page.id}-${fixIndex + 1}`,
            title: fix.title,
            severity: adaptIssueSeverity(toApiIssueSeverity(fix.severity)),
            impactedUsersCount: fix.affectedUsersCount,
            beforeCode: fix.beforeCode,
            afterCode: fix.afterCode,
            impactSummary: fix.impactDescription,
            changeSummaryTitle: "무엇이 변경되었나요?",
            changeSummaryBody: fix.changeDescription,
          })),
        }
      }),
    }
  },
}

export const resultAiFixHttpService: ResultAiFixService = {
  async getAiFix(simulationId) {
    const raw = await requestJsonWithFallback<SimulationAiFixResponseDto>([
      `/api/simulations/${simulationId}/results/ai-fix`,
      `/api/simulations/${simulationId}/ai-fix`,
      `/api/simulations/${simulationId}/ai`,
      `/simulations/${simulationId}/ai-fix`,
    ])

    return adaptAiFixResponseToViewModel(simulationId, raw)
  },
}
