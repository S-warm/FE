import type { ResultWcagIssueLinkViewModel } from "@/types/view-model/common/result-issue"
import type { ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export interface ResultWcagDistributionItemViewModel {
  severity: SeverityTokenViewModel
  count: number
  label: string
  description: string
}

export interface ResultWcagIssueViewModel extends ResultWcagIssueLinkViewModel {
  title: string
  severity: SeverityTokenViewModel
  description: string
}

export interface ResultWcagPageViewModel extends ResultPageSummaryViewModel {
  summary: {
    complianceScore: number
    wcagLabel: string
    totalTests: number
    passedTests: number
    foundIssues: number
  }
  distribution: ResultWcagDistributionItemViewModel[]
  issues: ResultWcagIssueViewModel[]
}

export interface ResultWcagViewModel {
  pages: ResultWcagPageViewModel[]
}
