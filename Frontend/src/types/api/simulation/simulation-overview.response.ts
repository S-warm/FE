export type SimulationOverviewAgeBand = "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대"

export interface SimulationOverviewAgeGroupDto {
  entered: number
  passed: number
  dropOff: number
  successRate: number
}

export interface SimulationOverviewSummaryDto {
  taskSuccessRate: number
  totalAgents: number
  avgCompletionSeconds: number
  dropOffAgents: number
}

export interface SimulationOverviewFunnelPanelDto {
  order: number
  pageName: string
  pageUrl: string
  totalEntered: number
  totalPassed: number
  panelSuccessRate: number
  avgTimeSeconds: number
  agentsByAge: Record<SimulationOverviewAgeBand, SimulationOverviewAgeGroupDto>
}

export interface SimulationOverviewResponseDto {
  summary: SimulationOverviewSummaryDto
  funnelPanels: SimulationOverviewFunnelPanelDto[]
}
