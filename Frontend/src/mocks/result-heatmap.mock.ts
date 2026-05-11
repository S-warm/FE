import { getMasterIssuesByPage, resultMasterPages } from "@/mocks/result-master.mock"

export type HeatmapMode = "click" | "move" | "scroll" | "attention"

export type HeatmapAgeBand = "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대" | "80대"

export interface HeatmapPoint {
  id: string
  x: number
  y: number
  intensity: number
}

export interface HeatmapMarker {
  id: string
  x: number
  y: number
  label: string
  severity: "critical" | "warning"
}

export interface HeatmapDefect {
  id: string
  code: string
  title: string
  description: string
  impactedUsers: number
}

export interface HeatmapTargetRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface HeatmapPageMock {
  id: string
  name: string
  screenshotUrl: string
  targetRegion?: HeatmapTargetRegion
  pointsByMode: Record<HeatmapMode, HeatmapPoint[]>
  markers: HeatmapMarker[]
  defects: HeatmapDefect[]
}

export const heatmapAgeBands: HeatmapAgeBand[] = ["10대", "20대", "30대", "40대", "50대", "60대", "70대", "80대"]

const TARGET_REGIONS: Record<string, HeatmapTargetRegion> = {
  login: { x: 40, y: 35, width: 20, height: 30 },
  main: { x: 20, y: 45, width: 65, height: 35 },
  signup: { x: 40, y: 55, width: 20, height: 20 },
  payment: { x: 10, y: 80, width: 50, height: 12 },
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Number((value * 100).toFixed(1))))
}

function createPoints(seed: string, x: number, y: number, baseIntensity: number): HeatmapPoint[] {
  const offsets: Array<[number, number, number]> = [
    [0, 0, 0],
    [-4.5, 3.2, -0.08],
    [3.8, -2.6, -0.05],
    [6.1, 4.4, -0.12],
    [-6.4, -3.7, -0.14],
  ]

  return offsets.map(([offsetX, offsetY, delta], index) => ({
    id: `${seed}-p-${index + 1}`,
    x: clampPercent(x + offsetX / 100),
    y: clampPercent(y + offsetY / 100),
    intensity: Number(Math.max(0.18, Math.min(0.98, baseIntensity + delta)).toFixed(2)),
  }))
}

function buildPointsByMode(pageId: string) {
  const issues = getMasterIssuesByPage(pageId as "login" | "main" | "signup" | "payment")
  const clusterPoints = issues.flatMap((issue, issueIndex) =>
    issue.heatmapClusters.flatMap((cluster, clusterIndex) =>
      createPoints(
        `${issue.id}-${clusterIndex + 1}`,
        cluster.x,
        cluster.y,
        0.42 + issueIndex * 0.05 + clusterIndex * 0.08
      )
    )
  )

  return {
    click: clusterPoints,
    move: clusterPoints.map((point, index) => ({
      ...point,
      id: `${point.id}-move`,
      intensity: Number(Math.min(0.99, point.intensity + 0.05).toFixed(2)),
      x: clampPercent(point.x / 100 + ((index % 3) - 1) * 0.012),
    })),
    scroll: clusterPoints.map((point, index) => ({
      ...point,
      id: `${point.id}-scroll`,
      intensity: Number(Math.max(0.16, point.intensity - 0.06).toFixed(2)),
      y: clampPercent(point.y / 100 + (index % 2 === 0 ? 0.018 : -0.014)),
    })),
    attention: clusterPoints.map((point) => ({
      ...point,
      id: `${point.id}-attention`,
      intensity: Number(Math.min(1, point.intensity + 0.09).toFixed(2)),
    })),
  }
}

export const heatmapPagesMock: HeatmapPageMock[] = resultMasterPages.map((page) => {
  const issues = getMasterIssuesByPage(page.id)
  const entries = issues.flatMap((issue) =>
    issue.heatmapClusters.map((cluster, clusterIndex) => ({
      issue,
      cluster,
      clusterIndex,
    }))
  )

  return {
    id: page.id,
    name: page.name,
    screenshotUrl: page.screenshotUrl,
    targetRegion: TARGET_REGIONS[page.id],
    pointsByMode: buildPointsByMode(page.id),
    markers: entries.map(({ issue, cluster }, index) => ({
      id: `${issue.id}|${cluster.ageBand}|${cluster.count}|${cluster.blockRate}|${cluster.repeatCount}`,
      x: clampPercent(cluster.x),
      y: clampPercent(cluster.y),
      label: String(index + 1),
      severity: issue.severity === "critical" ? "critical" : "warning",
    })),
    defects: entries.map(({ issue, cluster }) => ({
      id: issue.id,
      code: String(cluster.count),
      title: issue.title,
      description: `${issue.subCategory} 영역에서 ${cluster.ageBand} 사용자 반응이 집중된 클러스터입니다.`,
      impactedUsers: Math.min(issue.failCount, cluster.count * 7),
    })),
  }
})

export const defaultHeatmapPageId = heatmapPagesMock[0]?.id ?? "login"
