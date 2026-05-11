import { getMasterIssuesByPage, resultMasterPages, type ResultMasterSeverity } from "@/mocks/result-master.mock"

export type AiFixSeverity = "high" | "medium" | "low"

export interface AiFixItem {
  id: string
  title: string
  severity: AiFixSeverity
  impactedUsers: {
    count: number
  }
  beforeCode: string
  afterCode: string
  impactSummary: string
  changeSummaryTitle: string
  changeSummaryBody: string
}

export interface AiFixPage {
  id: string
  name: string
  fixes: AiFixItem[]
}

function mapSeverity(severity: ResultMasterSeverity): AiFixSeverity {
  if (severity === "critical") return "high"
  if (severity === "moderate") return "medium"
  return "low"
}

export const aiFixPagesMock: AiFixPage[] = resultMasterPages.map((page) => ({
  id: page.id,
  name: page.name,
  fixes: getMasterIssuesByPage(page.id).map((issue) => ({
    id: issue.id,
    title: issue.title,
    severity: mapSeverity(issue.severity),
    impactedUsers: { count: issue.failCount },
    beforeCode: issue.beforeCode,
    afterCode: issue.afterCode,
    impactSummary: issue.impactSummary,
    changeSummaryTitle: issue.changeSummaryTitle,
    changeSummaryBody: issue.changeSummaryBody,
  })),
}))

export const defaultAiFixPageId = aiFixPagesMock[0]?.id ?? "login"
export const defaultAiFixId = aiFixPagesMock[0]?.fixes[0]?.id ?? "login-1"
