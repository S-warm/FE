import type { ApiIssueSeverity } from "@/types/api/common/enums"

export interface SimulationAiFixBusinessItemDto {
  issueId?: string
  title?: string
  issueTitle?: string
  issue_title?: string
  selector: string
  beforeCode: string
  afterCode: string
  changeDescription: string
  impactDescription: string
  severity?: ApiIssueSeverity | "critical" | "high" | "medium" | "low"
  affectedUsersCount?: number
}

export interface SimulationAiFixBusinessResponseDto {
  url: string
  screenshotUrl?: string
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
