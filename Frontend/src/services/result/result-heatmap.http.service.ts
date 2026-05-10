import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"

export const resultHeatmapHttpService: ResultHeatmapService = {
  async getHeatmap() {
    throw createNotImplementedServiceError(
      "service://result-heatmap/http/get",
      "Heatmap HTTP 서비스는 아직 구현되지 않았습니다.",
    )
  },
}
