import type { ResultUxIssueLinkViewModel } from "@/types/view-model/common/result-issue"
import type { ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export interface ResultIssueExpectedBenefitViewModel {
  label: string
  delta: string
}

export interface ResultIssueViewModel extends ResultUxIssueLinkViewModel {
  title: string
  url: string
  category: string
  subCategory: string
  severity: SeverityTokenViewModel
  totalFailures: number
  failureRate: number
  affectedUsersCount: number
  affectedUsersPercent: number
  description: string
  selector: string
  tags: string[]
  personaList: string[]
  sessionIds: string[]
  affectedSessions: Array<{
    sessionId: string
    personaAge: string
  }>
  expectedBenefit?: ResultIssueExpectedBenefitViewModel | null
}

export interface ResultIssuesPageViewModel extends ResultPageSummaryViewModel {
  issues: ResultIssueViewModel[]
}

export interface ResultIssuesViewModel {
  pages: ResultIssuesPageViewModel[]
}
