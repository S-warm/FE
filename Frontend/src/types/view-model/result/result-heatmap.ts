import type { ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export type ResultAgeFilter = "all" | "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대"

export interface ResultHeatmapPointViewModel {
  issueId: string
  x: number
  y: number
  count: number
  severity: SeverityTokenViewModel
  errorType: "Timeout" | "Network" | "Console"
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
