import type { ApiWcagSeverity } from "@/types/api/common/enums"

export interface SimulationWcagBusinessDistributionDto {
  Critical: number
  Moderate: number
  Minor: number
}

export interface SimulationWcagBusinessIssueDto {
  wcagIssueId: string
  title: string
  severity: ApiWcagSeverity
  description: string
  html?: string
  wcag_criteria?: string
}

export interface SimulationWcagBusinessUrlResultDto {
  score: number
  wcagLabel: string
  distribution: SimulationWcagBusinessDistributionDto
  violations: SimulationWcagBusinessIssueDto[]
}

export interface SimulationWcagBusinessResponseDto {
  urls: Record<string, SimulationWcagBusinessUrlResultDto>
}

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
  selector?: string
}

export interface SimulationWcagResponseDto {
  summary: SimulationWcagSummaryDto
  distribution: SimulationWcagDistributionDto
  issues: SimulationWcagIssueDto[]
}

export type SimulationWcagApiResponseDto =
  | SimulationWcagBusinessResponseDto
  | SimulationWcagResponseDto
