import type { ResultPageBaseViewModel } from "@/types/view-model/common/result-page"

export type ResultAgeBand = "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대"

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
