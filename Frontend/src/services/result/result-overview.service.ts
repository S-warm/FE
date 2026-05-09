import type { ResultOverviewViewModel } from "@/types/view-model/result/result-overview"

export interface ResultOverviewService {
  getOverview(simulationId: string): Promise<ResultOverviewViewModel>
}
