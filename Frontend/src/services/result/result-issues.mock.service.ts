import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { demoIssues, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultIssuesService } from "@/services/result/result-issues.service"

function mapCategory(category: string) {
  // 한글 카테고리명 유지 (ResultIssuesPage의 filterCategories와 일치)
  if (category === "접근성") return "접근성"
  if (category === "사용성") return "사용성"
  if (category === "시각요소") return "시각요소"
  return "기타"
}

function groupIssuesByUrl(url: string) {
  return demoIssues.filter((issue) => issue.url === url)
}

export const resultIssuesMockService: ResultIssuesService = {
  async getIssues(simulationId) {
    await mockDelay()

    return {
      pages: demoResultPages.map((page, index) => {
        const issues = groupIssuesByUrl(page.url)

        return {
          ...createResultPageSummary({
            simulationId,
            order: index + 1,
            pageName: page.name,
            pageUrl: page.url,
            screenshotUrl: page.screenshotUrl,
            totalCount: issues.length,
            totalCountType: "issues",
            metaText: `${issues.length}건 이슈`,
          }),
          issues: issues.map((issue) => ({
            issueType: "ux" as const,
            issueId: issue.issueId,
            title: issue.title,
            category: mapCategory(issue.category),
            severity: adaptIssueSeverity(issue.severity),
            affectedUsersCount: issue.affectedUsersCount,
            affectedUsersPercent: issue.affectedUsersPercent,
            description: issue.description,
            selector: issue.targetHtml,
            tags: [...issue.tags],
            expectedBenefit: null,
          })),
        }
      }),
    }
  },
}

export const resultIssuesHttpService: ResultIssuesService = {
  async getIssues() {
    throw createNotImplementedServiceError("service://result-issues/http/get", "Issues HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
