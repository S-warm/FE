import type { ResultWcagViewModel } from "@/types/view-model/result/result-wcag"

export interface ResultWcagService {
  getWcag(simulationId: string): Promise<ResultWcagViewModel>
}
