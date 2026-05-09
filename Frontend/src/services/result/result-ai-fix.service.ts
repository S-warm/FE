import type { ResultAiFixViewModel } from "@/types/view-model/result/result-ai-fix"

export interface ResultAiFixService {
  getAiFix(simulationId: string): Promise<ResultAiFixViewModel>
}
