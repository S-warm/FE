import { adaptWcagResponseToViewModel, createResultPageBase } from "@/adapters/result"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultWcagService } from "@/services/result/result-wcag.service"
import { wcagResultMock } from "@/mocks/result-wcag.mock"
import type { ApiWcagSeverity } from "@/types/api/common/enums"
import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { SimulationWcagResponseDto } from "@/types/api/simulation/simulation-wcag.response"

function mapWcagSeverity(severity: "critical" | "moderate" | "minor"): ApiWcagSeverity {
  if (severity === "critical") return "Critical"
  if (severity === "moderate") return "Moderate"
  return "Minor"
}

function createWcagMockResponse(): SimulationWcagResponseDto {
  const pageResults = wcagResultMock.pageResults
  const totalTests = pageResults.reduce((sum, item) => sum + item.totalTests, 0)
  const passedTests = pageResults.reduce((sum, item) => sum + item.passedTests, 0)
  const foundIssues = pageResults.reduce((sum, item) => sum + item.foundIssues, 0)
  const critical = pageResults.reduce(
    (sum, item) => sum + (item.distribution.find((distributionItem) => distributionItem.severity === "critical")?.count ?? 0),
    0
  )
  const moderate = pageResults.reduce(
    (sum, item) => sum + (item.distribution.find((distributionItem) => distributionItem.severity === "moderate")?.count ?? 0),
    0
  )
  const minor = pageResults.reduce(
    (sum, item) => sum + (item.distribution.find((distributionItem) => distributionItem.severity === "minor")?.count ?? 0),
    0
  )

  const issues = pageResults.flatMap((page) =>
    page.details.map((detail) => ({
      wcagIssueId: detail.id,
      title: detail.title,
      severity: mapWcagSeverity(detail.severity),
      description: detail.description,
      selector: detail.selector,
    }))
  )

  return {
    summary: {
      complianceScore: Number(((passedTests / Math.max(totalTests, 1)) * 100).toFixed(1)),
      wcagLabel: pageResults[0]?.wcagLabel ?? "AA",
      totalTests,
      passedTests,
      foundIssues,
    },
    distribution: {
      critical,
      moderate,
      minor,
    },
    issues,
  }
}

export const resultWcagMockService: ResultWcagService = {
  async getWcag(simulationId) {
    await mockDelay()
    const pageContext = wcagResultMock.pageResults.map((page, index) =>
      createResultPageBase({
        simulationId,
        order: index + 1,
        pageName: page.pageName,
        pageUrl: `https://a-mall.com/${page.pageId}`,
      })
    )

    return adaptWcagResponseToViewModel(simulationId, createWcagMockResponse(), pageContext, wcagResultMock.pageResults)
  },
}

export const resultWcagHttpService: ResultWcagService = {
  async getWcag(simulationId) {
    const raw = await requestJsonWithFallback<SimulationWcagResponseDto>([
      `/api/simulations/${simulationId}/results/wcag`,
      `/api/simulations/${simulationId}/wcag`,
      `/simulations/${simulationId}/wcag`,
    ])

    let pageContext = [] as ReturnType<typeof createResultPageBase>[]

    try {
      const overview = await requestJsonWithFallback<SimulationOverviewResponseDto>([
        `/api/simulations/${simulationId}/results/overview`,
        `/api/simulations/${simulationId}/overview`,
        `/simulations/${simulationId}/overview`,
      ])

      pageContext = overview.funnelPanels.map((panel) =>
        createResultPageBase({
          simulationId,
          order: panel.order,
          pageName: panel.pageName,
          pageUrl: panel.pageUrl,
        })
      )
    } catch {
      pageContext = []
    }

    return adaptWcagResponseToViewModel(simulationId, raw, pageContext)
  },
}
