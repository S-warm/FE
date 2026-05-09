import type { ResultIssuesViewModel } from "@/types/view-model/result/result-issues"

export interface ResultIssuesService {
  getIssues(simulationId: string): Promise<ResultIssuesViewModel>
}
