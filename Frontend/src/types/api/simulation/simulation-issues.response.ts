import type { ApiIssueSeverity } from "@/types/api/common/enums"

export interface SimulationIssueDto {
  issueId: string
  title: string
  category: string
  severity: ApiIssueSeverity
  affectedUsersCount: number
  affectedUsersPercent: number
  description: string
  targetHtml: string
  tags: string[]
}

export interface SimulationIssuesPageDto {
  order: number
  pageName: string
  pageUrl: string
  screenshotUrl: string
  totalIssueCount: number
  issues: SimulationIssueDto[]
}

export interface SimulationIssuesResponseDto {
  pages: SimulationIssuesPageDto[]
}
