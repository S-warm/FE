import { buildResultPageId, resolveResultScreenshotUrl } from "@/features/result/shared/page-identity"
import { sortCategories } from "@/features/result/issues/model/category-style"
import type { BackendIssueSeverity, BackendSimulationIssuesResponse } from "@/shared/types/backend-api"

export type IssueBadgeVariant = "error" | "warning" | "info"

export interface IssuesViewModelIssue {
  id: string
  issueId: string
  title: string
  category: string
  severity: IssueBadgeVariant
  severityLabel: string
  tags: string[]
  affectedUsersCount: number
  affectedUsersPercent: number
  description: string
  targetHtml: string
}

export interface IssuesViewModelPage {
  id: string
  name: string
  screenshotUrl: string
  metaText: string
  issues: IssuesViewModelIssue[]
}

export interface IssuesViewModel {
  pages: IssuesViewModelPage[]
  categories: string[]
}

function mapIssueSeverity(severity: BackendIssueSeverity): IssueBadgeVariant {
  if (severity === "CRITICAL" || severity === "HIGH") return "error"
  if (severity === "MEDIUM") return "warning"
  return "info"
}

function mapSeverityLabel(severity: BackendIssueSeverity) {
  if (severity === "CRITICAL") return "치명적"
  if (severity === "HIGH") return "높음"
  if (severity === "MEDIUM") return "중간"
  return "낮음"
}

export function adaptIssuesResponse(response: BackendSimulationIssuesResponse): IssuesViewModel {
  const categorySet = new Set<string>()

  const pages = [...response.pages]
    .sort((left, right) => left.order - right.order)
    .map((page) => {
      const issues = page.issues.map((issue) => {
        categorySet.add(issue.category)

        return {
          id: issue.issueId,
          issueId: issue.issueId,
          title: issue.title,
          category: issue.category,
          severity: mapIssueSeverity(issue.severity),
          severityLabel: mapSeverityLabel(issue.severity),
          tags: issue.tags,
          affectedUsersCount: issue.affectedUsersCount,
          affectedUsersPercent: issue.affectedUsersPercent,
          description: issue.description,
          targetHtml: issue.targetHtml,
        }
      })

      return {
        id: buildResultPageId(page.order, page.pageName),
        name: page.pageName,
        screenshotUrl: resolveResultScreenshotUrl(page.screenshotUrl),
        metaText: `${page.totalIssueCount} issues`,
        issues,
      }
    })

  return {
    pages,
    categories: sortCategories([...categorySet]),
  }
}
