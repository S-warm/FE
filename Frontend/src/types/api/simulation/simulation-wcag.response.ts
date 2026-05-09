import type { ApiWcagSeverity } from "@/types/api/common/enums"

export interface SimulationWcagSummaryDto {
  complianceScore: number
  wcagLabel: string
  totalTests: number
  passedTests: number
  foundIssues: number
}

export interface SimulationWcagDistributionDto {
  critical: number
  moderate: number
  minor: number
}

export interface SimulationWcagIssueDto {
  wcagIssueId: string
  title: string
  severity: ApiWcagSeverity
  description: string
}

export interface SimulationWcagResponseDto {
  summary: SimulationWcagSummaryDto
  distribution: SimulationWcagDistributionDto
  issues: SimulationWcagIssueDto[]
}
