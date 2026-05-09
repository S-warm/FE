import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { SimulationService } from "@/services/simulation/simulation.service"

export const simulationMockService: SimulationService = {
  async createSimulation() {
    throw createNotImplementedServiceError("service://simulation/mock/create", "시뮬레이션 mock 생성 서비스는 아직 구현되지 않았습니다.")
  },
  async getSimulationList() {
    throw createNotImplementedServiceError("service://simulation/mock/list", "시뮬레이션 mock 목록 서비스는 아직 구현되지 않았습니다.")
  },
  async getSimulationHeader() {
    throw createNotImplementedServiceError("service://simulation/mock/header", "시뮬레이션 mock 헤더 서비스는 아직 구현되지 않았습니다.")
  },
}

export const simulationHttpService: SimulationService = {
  async createSimulation() {
    throw createNotImplementedServiceError("service://simulation/http/create", "시뮬레이션 HTTP 생성 서비스는 아직 구현되지 않았습니다.")
  },
  async getSimulationList() {
    throw createNotImplementedServiceError("service://simulation/http/list", "시뮬레이션 HTTP 목록 서비스는 아직 구현되지 않았습니다.")
  },
  async getSimulationHeader() {
    throw createNotImplementedServiceError("service://simulation/http/header", "시뮬레이션 HTTP 헤더 서비스는 아직 구현되지 않았습니다.")
  },
}
