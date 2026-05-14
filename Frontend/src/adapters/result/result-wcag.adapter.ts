import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptWcagSeverity } from "@/adapters/result/result-severity.adapter"
import type { WcagPageResult } from "@/mocks/result-wcag.mock"
import type { SimulationWcagResponseDto } from "@/types/api/simulation/simulation-wcag.response"
import type { ResultPageBaseViewModel } from "@/types/view-model/common/result-page"
import type { ResultWcagViewModel } from "@/types/view-model/result/result-wcag"

// 이슈 배열에서 severity별 분포를 계산
function buildDistributionFromIssues(
  issues: Array<{ severity: { raw: string } }>
) {
  const critical = issues.filter((issue) => issue.severity.raw === "Critical").length
  const moderate = issues.filter((issue) => issue.severity.raw === "Moderate").length
  const minor = issues.filter((issue) => issue.severity.raw === "Minor").length

  return [
    {
      severity: adaptWcagSeverity("Critical"),
      count: critical,
      label: "심각",
      description: "바로 고쳐야 할 문제",
    },
    {
      severity: adaptWcagSeverity("Moderate"),
      count: moderate,
      label: "중요",
      description: "사용하기 어려운 문제",
    },
    {
      severity: adaptWcagSeverity("Minor"),
      count: minor,
      label: "가벼움",
      description: "개선하면 좋을 문제",
    },
  ]
}

export function adaptWcagResponseToViewModel(
  simulationId: string,
  raw: SimulationWcagResponseDto,
  pageContext: ResultPageBaseViewModel[] = [],
  pageResults?: WcagPageResult[]
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

  // 페이지별 이슈 매핑
  const allIssues = raw.issues.map((issue) => ({
    issueType: "wcag" as const,
    wcagIssueId: issue.wcagIssueId,
    title: issue.title,
    severity: adaptWcagSeverity(issue.severity),
    description: issue.description,
    htmlElement: issue.selector,
  }))

  return {
    pages: pages.map((page, pageIndex) => {
      // pageResults가 있으면 해당 페이지의 이슈만 필터링
      let pageIssues = allIssues
      if (pageResults && pageResults[pageIndex]) {
        const pageDetail = pageResults[pageIndex]
        const pageIssueIds = new Set(pageDetail.details?.map((detail) => detail.id) || [])
        pageIssues = allIssues.filter((issue) => pageIssueIds.has(issue.wcagIssueId))
      }

      return {
        ...page,
        summary: {
          complianceScore: raw.summary.complianceScore,
          wcagLabel: raw.summary.wcagLabel,
          totalTests: raw.summary.totalTests,
          passedTests: raw.summary.passedTests,
          foundIssues: pageIssues.length,
        },
        // 각 페이지별 이슈에서 severity 분포를 다시 계산
        distribution: buildDistributionFromIssues(pageIssues),
        issues: pageIssues,
      }
    }),
  }
}
