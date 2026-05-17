import type { ResultUxIssueLinkViewModel } from "@/types/view-model/common/result-issue"
import type { ResultAgeFilter } from "@/types/view-model/common/result-meta"
import type { ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export interface ResultHeatmapPointViewModel extends ResultUxIssueLinkViewModel {
  x: number
  y: number
  count: number
  severity: SeverityTokenViewModel
  errorType: string
  affectedUsersCount: number
  blockRate: number
  repeatCount: number
  description: string
  ageBand: ResultAgeFilter
  errorBreakdown: {
    timeout: number
    network: number
    console: number
  }
}

export interface ResultHeatmapPageViewModel extends ResultPageSummaryViewModel {
  currentAgeGroup: ResultAgeFilter
  points: ResultHeatmapPointViewModel[]
  pagination: {
    totalCount: number
    currentPage: number
    pageSize: number
    hasMore: boolean
  }
}

export interface ResultHeatmapViewModel {
  pages: ResultHeatmapPageViewModel[]
}
