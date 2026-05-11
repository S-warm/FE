import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptWcagSeverity } from "@/adapters/result/result-severity.adapter"
import { wcagResultMock } from "@/mocks/result-wcag.mock"
import { mockDelay } from "@/services/core/mock-delay"
import type { ResultWcagService } from "@/services/result/result-wcag.service"

export const resultWcagMockService: ResultWcagService = {
  async getWcag(simulationId) {
    await mockDelay()

    return {
      pages: wcagResultMock.pageResults.map((page, index) => ({
        ...createResultPageSummary({
          simulationId,
          order: index + 1,
          pageName: page.pageName,
          pageUrl: `https://mock.swarm.local/${page.pageId}`,
          totalCount: page.foundIssues,
          totalCountType: "wcag-issues",
          metaText: `${page.foundIssues}건 WCAG 이슈`,
        }),
        summary: {
          complianceScore: page.complianceScore,
          wcagLabel: page.wcagLabel,
          totalTests: page.totalTests,
          passedTests: page.passedTests,
          foundIssues: page.foundIssues,
        },
        distribution: page.distribution.map((item) => ({
          severity: adaptWcagSeverity(
            item.severity === "critical"
              ? "Critical"
              : item.severity === "moderate"
                ? "Moderate"
                : "Minor",
          ),
          count: item.count,
          label: item.label,
          description: item.description,
        })),
        issues: page.details.map((detail) => ({
          issueType: "wcag" as const,
          wcagIssueId: detail.id,
          title: detail.title,
          severity: adaptWcagSeverity(
            detail.severity === "critical"
              ? "Critical"
              : detail.severity === "moderate"
                ? "Moderate"
                : "Minor",
          ),
          description: detail.description,
        })),
      })),
    }
  },
}
