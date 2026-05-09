import { adaptIssueCategory } from "@/adapters/result/result-category.adapter"
import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import type { SimulationIssuesResponseDto } from "@/types/api/simulation/simulation-issues.response"
import type { ResultIssuesViewModel } from "@/types/view-model/result/result-issues"

export function adaptIssuesResponseToViewModel(
  simulationId: string,
  raw: SimulationIssuesResponseDto
): ResultIssuesViewModel {
  return {
    pages: raw.pages.map((page) => ({
      ...createResultPageSummary({
        simulationId,
        order: page.order,
        pageName: page.pageName,
        pageUrl: page.pageUrl,
        screenshotUrl: page.screenshotUrl,
        totalCount: page.totalIssueCount,
        totalCountType: "issues",
        metaText: `${page.totalIssueCount}건 이슈`,
      }),
      issues: page.issues.map((issue) => ({
        issueType: "ux",
        issueId: issue.issueId,
        title: issue.title,
        category: adaptIssueCategory(issue.category),
        severity: adaptIssueSeverity(issue.severity),
        affectedUsersCount: issue.affectedUsersCount,
        affectedUsersPercent: issue.affectedUsersPercent,
        description: issue.description,
        selector: issue.targetHtml,
        tags: issue.tags,
        expectedBenefit: null,
      })),
    })),
  }
}
