import type { ApiIssueSeverity } from "@/types/api/common/enums"

export interface SimulationIssueAffectedPersonaDto {
  session_id: string
  persona_age: string
}

export interface SimulationBusinessIssueDto {
  issueId?: string
  url: string
  category: string
  subCategory?: string
  severity: ApiIssueSeverity | "critical" | "high" | "medium" | "low"
  title: string
  description: string
  targetHtml: string
  tags: string[]
  fail_count: number
  fail_rate: number
  session_ids: string[]
  persona_ages: string[]
  affected_personas: SimulationIssueAffectedPersonaDto[]
  pageName?: string
  screenshotUrl?: string
}

export interface SimulationIssuesBusinessResponseDto {
  total_issues: number
  issues: SimulationBusinessIssueDto[]
}

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

export type SimulationIssuesApiResponseDto =
  | SimulationIssuesBusinessResponseDto
  | SimulationIssuesResponseDto
