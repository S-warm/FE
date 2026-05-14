import { adaptIssuesResponseToViewModel } from "@/adapters/result/result-issues.adapter"
import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { searchResultIssuesMock } from "@/mocks/result-search.mock"
import { demoIssues, demoResultPages } from "@/mocks/uxswarm-demo.mock"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultIssuesService } from "@/services/result/result-issues.service"
import type { ApiIssueSeverity } from "@/types/api/common/enums"
import type { SimulationIssuesResponseDto } from "@/types/api/simulation/simulation-issues.response"

function mapCategory(category: string) {
  // 한글 카테고리명 유지 (ResultIssuesPage의 filterCategories와 일치)
  if (category === "접근성") return "접근성"
  if (category === "사용성") return "사용성"
  if (category === "시각요소") return "시각요소"
  return "기타"
}

function groupIssuesByUrl(url: string) {
  const issues = demoIssues.filter((issue) => issue.url === url)
  if (issues.length > 0) return issues

  if (url === "https://a-mall.com/search") {
    return searchResultIssuesMock.map((issue) => ({
      issueId: issue.issueId,
      category: issue.category,
      severity:
        issue.severity === "critical"
          ? "CRITICAL"
          : issue.severity === "high"
            ? "HIGH"
            : issue.severity === "medium"
              ? "MEDIUM"
              : "LOW",
      title: issue.title,
      description: issue.description,
      targetHtml: issue.targetHtml,
      tags: [...issue.tags],
      url: issue.url,
      affectedUsersCount: issue.affectedUsersCount,
      affectedUsersPercent: issue.affectedUsersPercent,
    }))
  }

  return issues
}

function toApiIssueSeverity(severity: string): ApiIssueSeverity {
  if (severity === "CRITICAL") return "CRITICAL"
  if (severity === "HIGH") return "HIGH"
  if (severity === "MEDIUM") return "MEDIUM"
  if (severity === "LOW") return "LOW"
  if (severity === "critical") return "CRITICAL"
  if (severity === "high") return "HIGH"
  if (severity === "medium") return "MEDIUM"
  return "LOW"
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
            severity: adaptIssueSeverity(toApiIssueSeverity(issue.severity)),
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
  async getIssues(simulationId) {
    const raw = await requestJsonWithFallback<SimulationIssuesResponseDto>([
      `/api/simulations/${simulationId}/results/issues`,
      `/api/simulations/${simulationId}/issues`,
      `/simulations/${simulationId}/issues`,
    ])

    return adaptIssuesResponseToViewModel(simulationId, raw)
  },
}
