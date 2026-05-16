import type { SimulationOverviewResponseDto } from "@/types/api/simulation/simulation-overview.response"
import type { ResultAgeBand } from "@/types/view-model/common/result-meta"
import type { ResultOverviewViewModel } from "@/types/view-model/result/result-overview"

const AGE_BAND_LABELS: Record<string, ResultAgeBand> = {
  "10s": "10대",
  "20s": "20대",
  "30s": "30대",
  "40s": "40대",
  "50s": "50대",
  "60s": "60대",
  "70s": "70대",
  "10대": "10대",
  "20대": "20대",
  "30대": "30대",
  "40대": "40대",
  "50대": "50대",
  "60대": "60대",
  "70대": "70대",
}

function formatNumberLabel(value: number) {
  return value.toLocaleString("ko-KR")
}

function formatPercentLabel(rate: number) {
  return `${(rate * 100).toFixed(1)}%`
}

function formatDurationLabelFromMs(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${remainingSeconds}초`
  }

  if (remainingSeconds <= 0) {
    return `${minutes}분`
  }

  return `${minutes}분 ${remainingSeconds}초`
}

function normalizeAgeBand(value?: string): ResultAgeBand | null {
  if (!value) {
    return null
  }

  return AGE_BAND_LABELS[value] ?? null
}

function normalizeOverviewPayload(raw: SimulationOverviewResponseDto) {
  if ("summary" in raw && "overview" in raw) {
    return {
      summary: raw.summary,
      overview: raw.overview,
    }
  }

  return {
    summary: {
      success_rate: raw.successRate,
      total_sessions: raw.totalSessions,
      avg_duration_ms: raw.avgDurationMs,
      success_count: raw.successCount,
    },
    overview: raw.ageOverview,
  }
}

export function adaptOverviewResponseToViewModel(
  simulationId: string,
  raw: SimulationOverviewResponseDto
): ResultOverviewViewModel {
  void simulationId
  const normalized = normalizeOverviewPayload(raw)
  const summary = normalized.summary
  const totalSessions = summary.total_sessions ?? 0
  const successCount = summary.success_count ?? 0
  const dropOffAgents = Math.max(0, totalSessions - successCount)

  const ageStats = normalized.overview
    .map((item) => {
      const ageBand = normalizeAgeBand(item.age_group ?? item.ageBand)

      if (!ageBand) {
        return null
      }

      const itemTotalSessions = item.total_sessions ?? item.totalSessions ?? 0
      const itemSuccessCount = item.success_count ?? item.successCount ?? 0
      const successRateRaw = item.success_rate ?? item.successRate ?? 0
      const failRateRaw = item.fail_rate ?? item.failRate ?? 0
      const avgDurationMs = item.avg_duration_ms ?? item.avgDurationMs ?? 0
      const avgActions = item.avg_actions ?? item.avgActions ?? null
      const avgDeclareFailure = item.avg_declare_failure ?? item.avgDeclareFailure ?? null

      return {
        ageBand,
        successRate: Number((successRateRaw * 100).toFixed(1)),
        failureRate: Number((failRateRaw * 100).toFixed(1)),
        dropOffRate: Number((failRateRaw * 100).toFixed(1)),
        avgDurationMinutes: Number((avgDurationMs / 60000).toFixed(1)),
        avgActions: avgActions === null ? null : Number(avgActions.toFixed(1)),
        avgDeclareFailure:
          avgDeclareFailure === null ? null : Number(avgDeclareFailure.toFixed(2)),
        totalSessions: itemTotalSessions,
        successCount: itemSuccessCount,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    summary: {
      taskSuccessRateLabel: formatPercentLabel(summary.success_rate ?? 0),
      totalAgentsLabel: `${formatNumberLabel(totalSessions)}명`,
      avgCompletionTimeLabel: formatDurationLabelFromMs(summary.avg_duration_ms ?? 0),
      dropOffAgentsLabel: `${formatNumberLabel(dropOffAgents)}명`,
    },
    pages: [],
    ageStats,
  }
}
