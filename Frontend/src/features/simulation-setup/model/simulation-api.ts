import { requestJson } from "@/shared/api/http-client"
import type {
  BackendSimulationCreateRequest,
  BackendSimulationCreateResponse,
} from "@/shared/types/backend-api"

export async function createSimulation(
  userId: string,
  payload: BackendSimulationCreateRequest,
  signal?: AbortSignal
) {
  return requestJson<BackendSimulationCreateResponse>("/simulations", {
    method: "POST",
    signal,
    query: {
      userId,
    },
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
}
