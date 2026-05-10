import { SERVICE_CONFIG } from "@/services/core/service-config"

import { authHttpService } from "@/services/auth/auth.http.service"
import { authMockService } from "@/services/auth/auth.mock.service"
import { resultAiFixHttpService } from "@/services/result/result-ai-fix.http.service"
import { resultAiFixMockService } from "@/services/result/result-ai-fix.mock.service"
import { resultHeatmapHttpService } from "@/services/result/result-heatmap.http.service"
import { resultHeatmapMockService } from "@/services/result/result-heatmap.mock.service"
import { resultIssuesHttpService } from "@/services/result/result-issues.http.service"
import { resultIssuesMockService } from "@/services/result/result-issues.mock.service"
import { resultOverviewHttpService } from "@/services/result/result-overview.http.service"
import { resultOverviewMockService } from "@/services/result/result-overview.mock.service"
import { resultWcagHttpService } from "@/services/result/result-wcag.http.service"
import { resultWcagMockService } from "@/services/result/result-wcag.mock.service"
import { simulationHttpService } from "@/services/simulation/simulation.http.service"
import { simulationMockService } from "@/services/simulation/simulation.mock.service"

// SERVICE_CONFIG.useMockServices 토글로 mock <-> http 서비스를 골라 노출한다.
// http 구현체 중 일부는 아직 stub 단계이며, src/services/core/http-client.ts 기반으로 본체를 채워나간다.
export const authService = SERVICE_CONFIG.useMockServices
  ? authMockService
  : authHttpService

export const simulationService = SERVICE_CONFIG.useMockServices
  ? simulationMockService
  : simulationHttpService

export const resultOverviewService = SERVICE_CONFIG.useMockServices
  ? resultOverviewMockService
  : resultOverviewHttpService

export const resultIssuesService = SERVICE_CONFIG.useMockServices
  ? resultIssuesMockService
  : resultIssuesHttpService

export const resultAiFixService = SERVICE_CONFIG.useMockServices
  ? resultAiFixMockService
  : resultAiFixHttpService

export const resultHeatmapService = SERVICE_CONFIG.useMockServices
  ? resultHeatmapMockService
  : resultHeatmapHttpService

export const resultWcagService = SERVICE_CONFIG.useMockServices
  ? resultWcagMockService
  : resultWcagHttpService
