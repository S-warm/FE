import type { ResultAgeBand } from "@/types/view-model/common/result-meta"

export interface GetResultHeatmapParams {
  simulationId: string
  ageGroups: ResultAgeBand[]
  page: number
  size: number
}
