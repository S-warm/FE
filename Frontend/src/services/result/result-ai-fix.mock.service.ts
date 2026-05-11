import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { demoFixesByUrl, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultAiFixService } from "@/services/result/result-ai-fix.service"

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
            severity: adaptIssueSeverity(fix.severity),
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
  async getAiFix() {
    throw createNotImplementedServiceError("service://result-ai-fix/http/get", "AI Fix HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
