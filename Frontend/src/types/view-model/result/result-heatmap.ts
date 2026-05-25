import type { ResultUxIssueLinkViewModel } from "@/types/view-model/common/result-issue"
import type { ResultAgeBand, ResultAgeFilter } from "@/types/view-model/common/result-meta"
import type { ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export type ResultHeatmapCoordinateMode =
  | "pixel"
  | "percent"
  | "ratio"
  | "pixel-scaled-thousand"

export interface ResultHeatmapPointViewModel extends ResultUxIssueLinkViewModel {
  markerId: string
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
  selectedAgeBands: ResultAgeBand[]
  coordinateMode: ResultHeatmapCoordinateMode
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
