import { createNotImplementedServiceError } from "@/services/core/api-service-error"
import type { ResultIssuesService } from "@/services/result/result-issues.service"

export const resultIssuesMockService: ResultIssuesService = {
  async getIssues() {
    throw createNotImplementedServiceError("service://result-issues/mock/get", "Issues mock 서비스는 아직 구현되지 않았습니다.")
  },
}

export const resultIssuesHttpService: ResultIssuesService = {
  async getIssues() {
    throw createNotImplementedServiceError("service://result-issues/http/get", "Issues HTTP 서비스는 아직 구현되지 않았습니다.")
  },
}
