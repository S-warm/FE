export type SimulationOverviewAgeGroupApiValue =
  | "10s"
  | "20s"
  | "30s"
  | "40s"
  | "50s"
  | "60s"
  | "70s"
  | "10대"
  | "20대"
  | "30대"
  | "40대"
  | "50대"
  | "60대"
  | "70대"

export interface SimulationOverviewSummaryApiDto {
  success_rate: number
  total_sessions: number
  avg_duration_ms: number
  success_count: number
}

export interface SimulationOverviewAgeItemApiDto {
  age_group?: SimulationOverviewAgeGroupApiValue
  ageBand?: SimulationOverviewAgeGroupApiValue
  total_sessions?: number
  totalSessions?: number
  success_count?: number
  successCount?: number
  success_rate?: number
  successRate?: number
  fail_rate?: number
  failRate?: number
  avg_duration_ms?: number
  avgDurationMs?: number
  avg_actions?: number
  avgActions?: number
  avg_declare_failure?: number
  avgDeclareFailure?: number
}

export interface SimulationOverviewBusinessResponseDto {
  summary: SimulationOverviewSummaryApiDto
  overview: SimulationOverviewAgeItemApiDto[]
}

export interface SimulationOverviewBackendResponseDto {
  totalSessions: number
  successCount: number
  successRate: number
  avgDurationMs: number
  ageOverview: SimulationOverviewAgeItemApiDto[]
}

export type SimulationOverviewResponseDto =
  | SimulationOverviewBusinessResponseDto
  | SimulationOverviewBackendResponseDto
