import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { SimulationService } from "@/services/simulation/simulation.service"

/**
 * BE 통합용 HTTP 구현체.
 * 이번 단계에서는 골격만 마련하고, 실제 fetch 호출은 다음 단계에서 채운다.
 * 모든 메서드는 createNotImplementedServiceError 를 throw 한다.
 */
export const simulationHttpService: SimulationService = {
  async createSimulation() {
    throw createNotImplementedServiceError(
      "service://simulation/http/create",
      "시뮬레이션 HTTP 생성 서비스는 아직 구현되지 않았습니다.",
    )
  },
  async getSimulationList() {
    throw createNotImplementedServiceError(
      "service://simulation/http/list",
      "시뮬레이션 HTTP 목록 서비스는 아직 구현되지 않았습니다.",
    )
  },
  async getSimulationHeader() {
    throw createNotImplementedServiceError(
      "service://simulation/http/header",
      "시뮬레이션 HTTP 헤더 서비스는 아직 구현되지 않았습니다.",
    )
  },
}
