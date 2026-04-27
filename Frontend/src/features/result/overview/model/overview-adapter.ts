import type {
  BackendOverviewAgeKey,
  BackendOverviewAgeGroup,
  BackendSimulationOverviewResponse,
} from "@/shared/types/backend-api"

const OVERVIEW_AGE_KEYS: BackendOverviewAgeKey[] = [
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대",
  "70대",
  "80대",
]

export interface OverviewMetricItem {
  key: string
  title: string
  value: string
  description: string
}

export interface OverviewProgressItem {
  label: string
  score: number
}

export interface OverviewAgeBreakdownRow {
  ageGroup: BackendOverviewAgeKey
  entered: number
  passed: number
  dropOff: number
  successRate: number
}

export interface OverviewPanelCard {
  id: string
  pageName: string
  pageUrl: string
  totalEntered: number
  totalPassed: number
  panelSuccessRate: number
  avgTimeSeconds: number
  ageRows: OverviewAgeBreakdownRow[]
}

export interface OverviewViewModel {
  metrics: OverviewMetricItem[]
  progress: OverviewProgressItem[]
  panels: OverviewPanelCard[]
}

function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`
}

function formatDurationSeconds(value: number) {
  if (value >= 60) {
    const minutes = value / 60
    return `${minutes.toFixed(minutes % 1 === 0 ? 0 : 1)} min`
  }

  return `${value.toFixed(value % 1 === 0 ? 0 : 1)} sec`
}

function buildAgeRows(agentsByAge: Record<BackendOverviewAgeKey, BackendOverviewAgeGroup>) {
  return OVERVIEW_AGE_KEYS.map((ageGroup) => {
    const row = agentsByAge[ageGroup]
    return {
      ageGroup,
      entered: row?.entered ?? 0,
      passed: row?.passed ?? 0,
      dropOff: row?.dropOff ?? 0,
      successRate: row?.successRate ?? 0,
    }
  })
}

export function adaptOverviewResponse(response: BackendSimulationOverviewResponse): OverviewViewModel {
  return {
    metrics: [
      {
        key: "taskSuccessRate",
        title: "Task success rate",
        value: formatPercent(response.summary.taskSuccessRate),
        description: "Successful agents across the full task flow.",
      },
      {
        key: "totalAgents",
        title: "Total agents",
        value: response.summary.totalAgents.toLocaleString(),
        description: "Agents included in this simulation run.",
      },
      {
        key: "avgCompletionSeconds",
        title: "Average completion time",
        value: formatDurationSeconds(response.summary.avgCompletionSeconds),
        description: "Average duration for agents that finished the flow.",
      },
      {
        key: "dropOffAgents",
        title: "Drop-off agents",
        value: response.summary.dropOffAgents.toLocaleString(),
        description: "Agents that did not complete the task.",
      },
    ],
    progress: response.funnelPanels.map((panel) => ({
      label: panel.pageName,
      score: panel.panelSuccessRate,
    })),
    panels: response.funnelPanels.map((panel) => ({
      id: `${panel.order}-${panel.pageName}`,
      pageName: panel.pageName,
      pageUrl: panel.pageUrl,
      totalEntered: panel.totalEntered,
      totalPassed: panel.totalPassed,
      panelSuccessRate: panel.panelSuccessRate,
      avgTimeSeconds: panel.avgTimeSeconds,
      ageRows: buildAgeRows(panel.agentsByAge),
    })),
  }
}
