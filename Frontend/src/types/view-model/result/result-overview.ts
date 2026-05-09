import type { ResultPageBaseViewModel } from "@/types/view-model/common/result-page"
import type { ResultAgeBand } from "@/types/view-model/common/result-meta"

export interface ResultOverviewMetricViewModel {
  taskSuccessRateLabel: string
  totalAgentsLabel: string
  avgCompletionTimeLabel: string
  dropOffAgentsLabel: string
}

export interface ResultOverviewAgeStatViewModel {
  ageBand: ResultAgeBand
  successRate: number
  failureRate?: number
  dropOffRate: number
  avgDurationMinutes?: number
  avgActions?: number | null
}

export interface ResultOverviewViewModel {
  summary: ResultOverviewMetricViewModel
  pages: ResultPageBaseViewModel[]
  ageStats: ResultOverviewAgeStatViewModel[]
}
