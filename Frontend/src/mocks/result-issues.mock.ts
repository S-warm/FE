import {
  getMasterIssuesByPage,
  resultMasterPageHighlights,
  resultMasterPages,
  type ResultMasterCategory,
  type ResultMasterSeverity,
} from "@/mocks/result-master.mock"

export type IssueCategory = "접근성" | "사용성" | "시각요소" | "기타"

export interface ResultIssue {
  id: string
  category: IssueCategory
  severity: "error" | "warning" | "info"
  title: string
  prioritySummary: string
  reportedPersona: string
  tags: string[]
  affectedUsers: {
    count: number
    percent: number
  }
  description: string
  selector: string
  expectedBenefit: {
    label: string
    delta: string
  }
}

export interface ResultIssuePage {
  id: string
  name: string
  issues: ResultIssue[]
  highlights: IssueCategory[]
}

function mapSeverity(severity: ResultMasterSeverity): ResultIssue["severity"] {
  if (severity === "critical") return "error"
  if (severity === "moderate") return "warning"
  return "info"
}

function mapCategory(category: ResultMasterCategory): IssueCategory {
  return category
}

export const resultIssuePages: ResultIssuePage[] = resultMasterPages.map((page) => ({
  id: page.id,
  name: page.name,
  highlights: resultMasterPageHighlights[page.id].map(mapCategory),
  issues: getMasterIssuesByPage(page.id).map((issue) => ({
    id: issue.id,
    category: mapCategory(issue.category),
    severity: mapSeverity(issue.severity),
    title: issue.title,
    prioritySummary: issue.prioritySummary,
    reportedPersona: issue.reportedPersona,
    tags: issue.tags,
    affectedUsers: {
      count: issue.failCount,
      percent: Number(((issue.failCount / 1000) * 100).toFixed(1)),
    },
    description: issue.description,
    selector: issue.selector,
    expectedBenefit: {
      label: issue.expectedBenefitLabel,
      delta: issue.expectedBenefitDelta,
    },
  })),
}))
