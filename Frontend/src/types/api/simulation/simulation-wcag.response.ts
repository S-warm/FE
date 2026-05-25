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
  html?: string
  wcagCriteria?: string
  wcag_criteria?: string
}

export interface SimulationWcagResponseDto {
  summary: SimulationWcagSummaryDto
  distribution: SimulationWcagDistributionDto
  issues: SimulationWcagIssueDto[]
}

export interface SimulationWcagFlatResponseDto {
  score: number
  wcagLabel: string
  distributionCritical: number
  distributionModerate: number
  distributionMinor: number
  issues: SimulationWcagIssueDto[]
}

export interface SimulationWcagPageDto {
  order: number
  pageName?: string
  pageUrl?: string
  screenshotUrl?: string | null
  totalIssueCount?: number
  totalWcagIssueCount?: number
  score?: number
  wcagLabel?: string
  summary?: SimulationWcagSummaryDto
  distribution?: SimulationWcagDistributionDto
  distributionCritical?: number
  distributionModerate?: number
  distributionMinor?: number
  issues: SimulationWcagIssueDto[]
}

export interface SimulationWcagPagesResponseDto {
  pages: SimulationWcagPageDto[]
}

export type SimulationWcagApiResponseDto =
  | SimulationWcagBusinessResponseDto
  | SimulationWcagPagesResponseDto
  | SimulationWcagResponseDto
  | SimulationWcagFlatResponseDto
