import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptWcagSeverity } from "@/adapters/result/result-severity.adapter"
import { demoResultPages, demoWcagPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultWcagService } from "@/services/result/result-wcag.service"

function buildDistribution(distribution: { critical: number; moderate: number; minor: number }) {
  return [
    {
      severity: adaptWcagSeverity("Critical"),
      count: distribution.critical,
      label: "치명적",
      description: "즉시 수정이 필요한 접근성 문제",
    },
    {
      severity: adaptWcagSeverity("Moderate"),
      count: distribution.moderate,
      label: "보통",
      description: "사용성에 영향을 주는 주요 문제",
    },
    {
      severity: adaptWcagSeverity("Minor"),
      count: distribution.minor,
      label: "경미",
      description: "개선 권장 수준의 접근성 문제",
    },
  ]
}

export const resultWcagMockService: ResultWcagService = {
  async getWcag(simulationId) {
    await mockDelay()

    return {
      pages: demoWcagPages.map((page, index) => {
        const pageMeta = demoResultPages.find((item) => item.id === page.pageId)

        return {
          ...createResultPageSummary({
            simulationId,
            order: index + 1,
            pageName: page.pageName,
            pageUrl: page.url,
            screenshotUrl: pageMeta?.screenshotUrl,
            totalCount: page.summary.foundIssues,
            totalCountType: "wcag-issues",
            metaText: `${page.summary.foundIssues}건 WCAG 이슈`,
          }),
          summary: page.summary,
          distribution: buildDistribution(page.distribution),
          issues: page.issues.map((issue) => ({
            issueType: "wcag" as const,
            wcagIssueId: issue.wcagIssueId,
            title: issue.title,
            severity: adaptWcagSeverity(issue.severity),
            description: issue.description,
          })),
        }
      }),
    }
  },
}

export const resultWcagHttpService: ResultWcagService = {
  async getWcag() {
    throw createNotImplementedServiceError("service://result-wcag/http/get", "WCAG HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
