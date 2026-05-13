import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptWcagSeverity } from "@/adapters/result/result-severity.adapter"
import type { SimulationWcagResponseDto } from "@/types/api/simulation/simulation-wcag.response"
import type { ResultPageBaseViewModel } from "@/types/view-model/common/result-page"
import type { ResultWcagViewModel } from "@/types/view-model/result/result-wcag"

function buildDistribution(raw: SimulationWcagResponseDto) {
  return [
    {
      severity: adaptWcagSeverity("Critical"),
      count: raw.distribution.critical,
      label: "심각",
      description: "바로 고쳐야 할 문제",
    },
    {
      severity: adaptWcagSeverity("Moderate"),
      count: raw.distribution.moderate,
      label: "중요",
      description: "사용하기 어려운 문제",
    },
    {
      severity: adaptWcagSeverity("Minor"),
      count: raw.distribution.minor,
      label: "가벼움",
      description: "개선하면 좋을 문제",
    },
  ]
}

export function adaptWcagResponseToViewModel(
  simulationId: string,
  raw: SimulationWcagResponseDto,
  pageContext: ResultPageBaseViewModel[] = []
): ResultWcagViewModel {
  const pages =
    pageContext.length > 0
      ? pageContext.map((page) =>
          createResultPageSummary({
            simulationId,
            order: page.order,
            pageName: page.pageName,
            pageUrl: page.pageUrl,
            screenshotUrl: page.screenshotUrl,
            totalCount: raw.summary.foundIssues,
            totalCountType: "wcag-issues",
            metaText: `${raw.summary.foundIssues}건 WCAG 이슈`,
          })
        )
      : [
          createResultPageSummary({
            simulationId,
            order: 1,
            pageName: "전체 페이지",
            pageUrl: undefined,
            screenshotUrl: undefined,
            totalCount: raw.summary.foundIssues,
            totalCountType: "wcag-issues",
            metaText: `${raw.summary.foundIssues}건 WCAG 이슈`,
          }),
        ]

  const distribution = buildDistribution(raw)
  const issues = raw.issues.map((issue) => ({
    issueType: "wcag" as const,
    wcagIssueId: issue.wcagIssueId,
    title: issue.title,
    severity: adaptWcagSeverity(issue.severity),
    description: issue.description,
  }))

  return {
    pages: pages.map((page) => ({
      ...page,
      summary: {
        complianceScore: raw.summary.complianceScore,
        wcagLabel: raw.summary.wcagLabel,
        totalTests: raw.summary.totalTests,
        passedTests: raw.summary.passedTests,
        foundIssues: raw.summary.foundIssues,
      },
      distribution,
      issues,
    })),
  }
}
