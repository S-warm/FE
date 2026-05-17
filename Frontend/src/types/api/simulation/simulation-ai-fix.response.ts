import type { ApiIssueSeverity } from "@/types/api/common/enums"

export interface SimulationAiFixBusinessItemDto {
  issue_title: string
  selector: string
  before: string
  after: string
  description: string
  impact: string
  severity?: ApiIssueSeverity | "critical" | "high" | "medium" | "low"
  affectedUsersCount?: number
}

export interface SimulationAiFixBusinessResponseDto {
  url: string
  fixes: SimulationAiFixBusinessItemDto[]
}

export interface SimulationAiFixDto {
  issueId: string
  title: string
  severity: ApiIssueSeverity
  affectedUsersCount: number
  beforeCode: string
  afterCode: string
  impactDescription: string
  changeDescription: string
}

export interface SimulationAiFixPageDto {
  order: number
  pageName: string
  pageUrl: string
  screenshotUrl: string
  totalFixCount: number
  fixes: SimulationAiFixDto[]
}

export interface SimulationAiFixResponseDto {
  pages: SimulationAiFixPageDto[]
}

export type SimulationAiFixApiResponseDto =
  | SimulationAiFixBusinessResponseDto
  | SimulationAiFixResponseDto
