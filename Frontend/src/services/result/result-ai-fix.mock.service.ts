import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultAiFixService } from "@/services/result/result-ai-fix.service"

export const resultAiFixMockService: ResultAiFixService = {
  async getAiFix() {
    throw createNotImplementedServiceError("service://result-ai-fix/mock/get", "AI Fix mock 서비스는 아직 구현되지 않았습니다.")
  },
}

export const resultAiFixHttpService: ResultAiFixService = {
  async getAiFix() {
    throw createNotImplementedServiceError("service://result-ai-fix/http/get", "AI Fix HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
