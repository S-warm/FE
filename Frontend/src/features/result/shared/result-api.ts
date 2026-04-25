import { requestJson } from "@/shared/api/http-client"
import type { ResultPageSummary } from "@/shared/types/result"

export interface ResultSimulationSummary {
  id: string
  title: string
  createdAt: string
}

export interface ResultPagesResponse {
  simulation: ResultSimulationSummary
  pages: ResultPageSummary[]
}

export async function fetchResultPages(simulationId: string, signal?: AbortSignal) {
  return requestJson<ResultPagesResponse>(`/results/${simulationId}/pages`, {
    signal,
  })
}
