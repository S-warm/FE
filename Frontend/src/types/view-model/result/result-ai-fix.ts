import type { ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export interface ResultAiFixItemViewModel {
  issueId: string
  title: string
  severity: SeverityTokenViewModel
  impactedUsersCount: number
  beforeCode: string
  afterCode: string
  impactSummary: string
  changeSummaryTitle: string
  changeSummaryBody: string
}

export interface ResultAiFixPageViewModel extends ResultPageSummaryViewModel {
  fixes: ResultAiFixItemViewModel[]
}

export interface ResultAiFixViewModel {
  pages: ResultAiFixPageViewModel[]
}
