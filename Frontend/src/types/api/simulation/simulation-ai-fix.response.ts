import type { ApiIssueSeverity } from "@/types/api/common/enums"

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
