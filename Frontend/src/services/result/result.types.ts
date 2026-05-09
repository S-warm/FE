import type { ResultAgeFilter } from "@/types/view-model/result/result-heatmap"

export interface GetResultHeatmapParams {
  simulationId: string
  ageGroup: ResultAgeFilter
  page: number
  size: number
}
