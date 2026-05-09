import type { GetResultHeatmapParams } from "@/services/result/result.types"
import type { ResultHeatmapViewModel } from "@/types/view-model/result/result-heatmap"

export interface ResultHeatmapService {
  getHeatmap(params: GetResultHeatmapParams): Promise<ResultHeatmapViewModel>
}
