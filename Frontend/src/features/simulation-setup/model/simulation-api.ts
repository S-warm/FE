import { requestJson } from "@/shared/api/http-client"

export interface CreateSimulationPayload {
  targetUrl: string
  projectTitle: string
  personaCount: number
  digitalLiteracy: "low" | "medium" | "high"
  successCondition: string
  ageRatios: {
    teen: number
    fifty: number
    eighty: number
  }
}

export interface CreateSimulationResponse {
  simulationId: string
  status: "queued" | "running"
}

export async function createSimulation(
  payload: CreateSimulationPayload,
  signal?: AbortSignal
) {
  return requestJson<CreateSimulationResponse>("/simulations", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
}
