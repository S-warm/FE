import { adaptIssuesResponseToViewModel } from "@/adapters/result"
import { mockDelay } from "@/services/core/mock-delay"
import type { ResultIssuesService } from "@/services/result/result-issues.service"
import { resultIssuePages } from "@/mocks/result-issues.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import type { ApiIssueSeverity } from "@/types/api/common/enums"
import type { SimulationIssuesResponseDto } from "@/types/api/simulation/simulation-issues.response"

function mapIssueSeverity(severity: "error" | "warning" | "info"): ApiIssueSeverity {
  if (severity === "error") return "CRITICAL"
  if (severity === "warning") return "HIGH"
  return "LOW"
}

function createIssuesMockResponse(): SimulationIssuesResponseDto {
  return {
    pages: resultIssuePages.map((page, index) => {
      const pageMeta = resultPagesMock.find((item) => item.id === page.id)
      return {
        order: index + 1,
        pageName: page.name,
        pageUrl: `https://mock.swarm.local/${page.id}`,
        screenshotUrl: pageMeta?.screenshotUrl ?? "",
        totalIssueCount: page.issues.length,
        issues: page.issues.map((issue) => ({
          issueId: issue.id,
          title: issue.title,
          category:
            issue.category === "접근성"
              ? "Accessibility"
              : issue.category === "사용성"
                ? "Usability"
                : issue.category === "시각요소"
                  ? "Visual"
                  : "Other",
          severity: mapIssueSeverity(issue.severity),
          affectedUsersCount: issue.affectedUsers.count,
          affectedUsersPercent: issue.affectedUsers.percent,
          description: issue.description,
          targetHtml: issue.selector,
          tags: issue.tags,
        })),
      }
    }),
  }
}

export const resultIssuesMockService: ResultIssuesService = {
  async getIssues(simulationId) {
    await mockDelay()
    return adaptIssuesResponseToViewModel(simulationId, createIssuesMockResponse())
  },
}
