export type AgeGroup = "10s" | "20s" | "30s" | "40s" | "50s" | "60s" | "70s"

export interface SummaryOverview {
  age_group: AgeGroup
  total_sessions: number
  success_count: number
  success_rate: number
  fail_rate: number
  avg_duration_ms: number
  avg_actions: number
  avg_declare_failure: number
}

export interface SummaryData {
  summary: {
    total_sessions: number
    success_count: number
    success_rate: number
    avg_duration_ms: number
  }
  overview: SummaryOverview[]
}

export const summaryMockData: SummaryData = {
  summary: {
    total_sessions: 720,
    success_count: 202,
    success_rate: 202 / 720,
    avg_duration_ms: 252000,
  },
  overview: [
    {
      age_group: "10s" as const,
      total_sessions: 72,
      success_count: 45,
      success_rate: 45 / 72,
      fail_rate: 27 / 72,
      avg_duration_ms: 66000,
      avg_actions: 7.42,
      avg_declare_failure: 0.38,
    },
    {
      age_group: "20s" as const,
      total_sessions: 144,
      success_count: 69,
      success_rate: 69 / 144,
      fail_rate: 75 / 144,
      avg_duration_ms: 78000,
      avg_actions: 8.31,
      avg_declare_failure: 0.52,
    },
    {
      age_group: "30s" as const,
      total_sessions: 144,
      success_count: 55,
      success_rate: 55 / 144,
      fail_rate: 89 / 144,
      avg_duration_ms: 132000,
      avg_actions: 10.12,
      avg_declare_failure: 0.62,
    },
    {
      age_group: "40s" as const,
      total_sessions: 144,
      success_count: 26,
      success_rate: 26 / 144,
      fail_rate: 118 / 144,
      avg_duration_ms: 234000,
      avg_actions: 12.84,
      avg_declare_failure: 0.82,
    },
    {
      age_group: "50s" as const,
      total_sessions: 108,
      success_count: 6,
      success_rate: 6 / 108,
      fail_rate: 102 / 108,
      avg_duration_ms: 348000,
      avg_actions: 15.21,
      avg_declare_failure: 0.95,
    },
    {
      age_group: "60s" as const,
      total_sessions: 72,
      success_count: 1,
      success_rate: 1 / 72,
      fail_rate: 71 / 72,
      avg_duration_ms: 462000,
      avg_actions: 17.63,
      avg_declare_failure: 0.98,
    },
    {
      age_group: "70s" as const,
      total_sessions: 36,
      success_count: 0,
      success_rate: 0.0,
      fail_rate: 1.0,
      avg_duration_ms: 528000,
      avg_actions: 18.94,
      avg_declare_failure: 1.0,
    },
  ]
}
