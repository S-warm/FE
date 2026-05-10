import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultOverviewService } from "@/services/result/result-overview.service"

export const resultOverviewHttpService: ResultOverviewService = {
  async getOverview() {
    throw createNotImplementedServiceError(
      "service://result-overview/http/get",
      "Overview HTTP 서비스는 아직 구현되지 않았습니다.",
    )
  },
}
