import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultWcagService } from "@/services/result/result-wcag.service"

export const resultWcagMockService: ResultWcagService = {
  async getWcag() {
    throw createNotImplementedServiceError("service://result-wcag/mock/get", "WCAG mock 서비스는 아직 구현되지 않았습니다.")
  },
}

export const resultWcagHttpService: ResultWcagService = {
  async getWcag() {
    throw createNotImplementedServiceError("service://result-wcag/http/get", "WCAG HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
