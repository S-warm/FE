import { SERVICE_CONFIG } from "@/services/core/service-config"
import { resultAiFixHttpService, resultAiFixMockService } from "@/services/result/result-ai-fix.mock.service"
import { resultHeatmapHttpService, resultHeatmapMockService } from "@/services/result/result-heatmap.mock.service"
import { resultIssuesHttpService, resultIssuesMockService } from "@/services/result/result-issues.mock.service"
import { resultOverviewHttpService, resultOverviewMockService } from "@/services/result/result-overview.mock.service"
import { resultWcagHttpService, resultWcagMockService } from "@/services/result/result-wcag.mock.service"
import { simulationHttpService, simulationMockService } from "@/services/simulation/simulation.mock.service"

export const simulationService = SERVICE_CONFIG.useMockServices ? simulationMockService : simulationHttpService
export const resultOverviewService = SERVICE_CONFIG.useMockServices ? resultOverviewMockService : resultOverviewHttpService
export const resultIssuesService = SERVICE_CONFIG.useMockServices ? resultIssuesMockService : resultIssuesHttpService
export const resultAiFixService = SERVICE_CONFIG.useMockServices ? resultAiFixMockService : resultAiFixHttpService
export const resultHeatmapService = SERVICE_CONFIG.useMockServices ? resultHeatmapMockService : resultHeatmapHttpService
export const resultWcagService = SERVICE_CONFIG.useMockServices ? resultWcagMockService : resultWcagHttpService
