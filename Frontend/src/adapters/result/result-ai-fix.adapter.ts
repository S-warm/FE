import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import type { SimulationAiFixResponseDto } from "@/types/api/simulation/simulation-ai-fix.response"
import type { ResultAiFixViewModel } from "@/types/view-model/result/result-ai-fix"

export function adaptAiFixResponseToViewModel(
  simulationId: string,
  raw: SimulationAiFixResponseDto
): ResultAiFixViewModel {
  return {
    pages: raw.pages.map((page) => ({
      ...createResultPageSummary({
        simulationId,
        order: page.order,
        pageName: page.pageName,
        pageUrl: page.pageUrl,
        screenshotUrl: page.screenshotUrl,
        totalCount: page.totalFixCount,
        totalCountType: "fixes",
        metaText: `${page.totalFixCount}건 수정 제안`,
      }),
      fixes: page.fixes.map((fix) => ({
        issueType: "ux",
        issueId: fix.issueId,
        title: fix.title,
        severity: adaptIssueSeverity(fix.severity),
        impactedUsersCount: fix.affectedUsersCount,
        beforeCode: fix.beforeCode,
        afterCode: fix.afterCode,
        impactSummary: fix.impactDescription,
        changeSummaryTitle: "코드 변경 요약",
        changeSummaryBody: fix.changeDescription,
      })),
    })),
  }
}
