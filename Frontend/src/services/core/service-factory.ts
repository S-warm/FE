import { SERVICE_CONFIG } from "@/services/core/service-config"
import { resultAiFixHttpService, resultAiFixMockService } from "@/services/result/result-ai-fix.mock.service"
import { resultHeatmapHttpService, resultHeatmapMockService } from "@/services/result/result-heatmap.mock.service"
import { resultIssuesHttpService, resultIssuesMockService } from "@/services/result/result-issues.mock.service"
import { resultOverviewHttpService, resultOverviewMockService } from "@/services/result/result-overview.mock.service"
import { resultWcagHttpService, resultWcagMockService } from "@/services/result/result-wcag.mock.service"
import { simulationHttpService, simulationMockService } from "@/services/simulation/simulation.mock.service"
import type { SimulationService } from "@/services/simulation/simulation.service"
import type { ResultOverviewService } from "@/services/result/result-overview.service"
import type { ResultIssuesService } from "@/services/result/result-issues.service"
import type { ResultAiFixService } from "@/services/result/result-ai-fix.service"
import type { ResultHeatmapService } from "@/services/result/result-heatmap.service"
import type { ResultWcagService } from "@/services/result/result-wcag.service"

/**
 * Mock/HTTP 서비스 쌍 타입
 */
interface ServicePair<T> {
  mock: T
  http: T
}

/**
 * 전체 서비스 레지스트리
 * 새로운 서비스를 추가할 때는 이 인터페이스에 추가하고
 * serviceRegistry 객체에 구현을 추가하면 됩니다.
 */
interface ServiceRegistry {
  simulation: ServicePair<SimulationService>
  resultOverview: ServicePair<ResultOverviewService>
  resultIssues: ServicePair<ResultIssuesService>
  resultAiFix: ServicePair<ResultAiFixService>
  resultHeatmap: ServicePair<ResultHeatmapService>
  resultWcag: ServicePair<ResultWcagService>
}

/**
 * Mock 또는 HTTP 서비스를 선택하는 함수
 *
 * SERVICE_CONFIG.useMockServices에 따라
 * 해당하는 서비스 구현을 반환합니다.
 *
 * @param pair - Mock과 HTTP 서비스를 포함하는 쌍
 * @returns 설정에 따른 선택된 서비스
 */
function selectService<T>(pair: ServicePair<T>): T {
  return SERVICE_CONFIG.useMockServices ? pair.mock : pair.http
}

/**
 * 서비스 레지스트리
 *
 * Mock과 HTTP 서비스 구현을 한 곳에서 관리합니다.
 * 새로운 서비스를 추가할 때는:
 * 1. ServiceRegistry에 타입 추가
 * 2. 아래 객체에 구현 추가
 * 3. 맨 아래 export 문 추가
 */
const serviceRegistry: ServiceRegistry = {
  simulation: {
    mock: simulationMockService,
    http: simulationHttpService,
  },
  resultOverview: {
    mock: resultOverviewMockService,
    http: resultOverviewHttpService,
  },
  resultIssues: {
    mock: resultIssuesMockService,
    http: resultIssuesHttpService,
  },
  resultAiFix: {
    mock: resultAiFixMockService,
    http: resultAiFixHttpService,
  },
  resultHeatmap: {
    mock: resultHeatmapMockService,
    http: resultHeatmapHttpService,
  },
  resultWcag: {
    mock: resultWcagMockService,
    http: resultWcagHttpService,
  },
}

/**
 * 서비스 Exports
 *
 * SERVICE_CONFIG.useMockServices에 따라
 * Mock 또는 HTTP 서비스를 제공합니다.
 */
export const simulationService = selectService(serviceRegistry.simulation)
export const resultOverviewService = selectService(
  serviceRegistry.resultOverview
)
export const resultIssuesService = selectService(serviceRegistry.resultIssues)
export const resultAiFixService = selectService(serviceRegistry.resultAiFix)
export const resultHeatmapService = selectService(
  serviceRegistry.resultHeatmap
)
export const resultWcagService = selectService(serviceRegistry.resultWcag)
