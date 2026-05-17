import type { ResultAgeFilter } from "@/types/view-model/common/result-meta"

export interface GetResultHeatmapParams {
  simulationId: string
  ageGroup: ResultAgeFilter
  page: number
  size: number
}
