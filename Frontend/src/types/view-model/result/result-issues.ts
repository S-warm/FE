import type { ResultUxIssueLinkViewModel } from "@/types/view-model/common/result-issue"
import type { ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export interface ResultIssueExpectedBenefitViewModel {
  label: string
  delta: string
}

export interface ResultIssueViewModel extends ResultUxIssueLinkViewModel {
  title: string
  category: string
  severity: SeverityTokenViewModel
  affectedUsersCount: number
  affectedUsersPercent: number
  description: string
  selector: string
  tags: string[]
  expectedBenefit?: ResultIssueExpectedBenefitViewModel | null
}

export interface ResultIssuesPageViewModel extends ResultPageSummaryViewModel {
  issues: ResultIssueViewModel[]
}

export interface ResultIssuesViewModel {
  pages: ResultIssuesPageViewModel[]
}
