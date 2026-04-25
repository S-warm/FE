import type {
  HeatmapAgentSession,
  HeatmapErrorKind,
  HeatmapLogEvent,
} from "@/mocks/result-heatmap-log.mock"

export const HEATMAP_GRID_COLS = 64
export const HEATMAP_GRID_ROWS = 40

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function selectErrorEvents(events: HeatmapLogEvent[]) {
  return events.filter((event) => event.block || Boolean(event.errorKind))
}

function cellKey(col: number, row: number) {
  return row * HEATMAP_GRID_COLS + col
}

interface CellAgg {
  eventCount: number
  dwellSum: number
  retriesSum: number
  blockCount: number
  agentIds: Set<string>
  blockAgents: Set<string>
  errorKindCount: Record<HeatmapErrorKind, number>
  httpStatusCount: Record<number, number>
}

export interface HeatmapCellSummary {
  key: number
  x: number
  y: number
  score: number
  impactedAgents: number
  avgRetries: number
  blockRate: number
  errors: {
    timeout: number
    console: number
    network: number
    topHttpStatuses: Array<{ status: number; count: number }>
  }
}

export interface HeatmapHotspot {
  id: string
  rank: number
  x: number
  y: number
  score: number
  impactedAgents: number
  avgRetries: number
  blockRate: number
  errors: HeatmapCellSummary["errors"]
}

function buildFallbackHotspots(cells: Map<number, HeatmapCellSummary>, limit: number) {
  const sorted = Array.from(cells.values()).sort((a, b) => {
    const scoreDelta = b.score - a.score
    if (Math.abs(scoreDelta) > 0.0001) return scoreDelta
    return b.impactedAgents - a.impactedAgents
  })

  const preferred = sorted.filter((cell) => cell.score >= 0.18)
  const pool = preferred.length ? preferred : sorted
  const picked: Array<{ col: number; row: number; cell: HeatmapCellSummary }> = []

  for (const cell of pool) {
    if (picked.length >= limit) break
    const col = cell.key % HEATMAP_GRID_COLS
    const row = Math.floor(cell.key / HEATMAP_GRID_COLS)
    const tooClose = picked.some((item) => Math.hypot(item.col - col, item.row - row) < 9)
    if (tooClose) continue
    picked.push({ col, row, cell })
  }

  if (picked.length === 0 && sorted.length) {
    const first = sorted[0]
    picked.push({
      col: first.key % HEATMAP_GRID_COLS,
      row: Math.floor(first.key / HEATMAP_GRID_COLS),
      cell: first,
    })
  }

  return picked.map(({ col, row, cell }, index) => ({
    id: `fb-${col}-${row}`,
    rank: index + 1,
    x: cell.x,
    y: cell.y,
    score: cell.score,
    impactedAgents: cell.impactedAgents,
    avgRetries: cell.avgRetries,
    blockRate: cell.blockRate,
    errors: cell.errors,
  }))
}

export function analyzeSessions({
  sessions,
  timeEndMs,
}: {
  sessions: HeatmapAgentSession[]
  timeEndMs: number
}) {
  const cellAgg = new Map<number, CellAgg>()
  let totalEventCount = 0
  let totalDwellSum = 0
  const totalAgents = new Set<string>()

  for (const session of sessions) {
    totalAgents.add(session.agentId)
    const events = selectErrorEvents(session.events)
    for (const event of events) {
      if (event.tMs > timeEndMs) continue
      if (!Number.isFinite(event.x) || !Number.isFinite(event.y)) continue

      const col = clamp(Math.floor(event.x * HEATMAP_GRID_COLS), 0, HEATMAP_GRID_COLS - 1)
      const row = clamp(Math.floor(event.y * HEATMAP_GRID_ROWS), 0, HEATMAP_GRID_ROWS - 1)
      const key = cellKey(col, row)

      const agg = cellAgg.get(key) ?? {
        eventCount: 0,
        dwellSum: 0,
        retriesSum: 0,
        blockCount: 0,
        agentIds: new Set<string>(),
        blockAgents: new Set<string>(),
        errorKindCount: { timeout: 0, console: 0, network: 0 },
        httpStatusCount: {},
      }

      agg.eventCount += 1
      agg.dwellSum += event.dwellMs
      agg.retriesSum += event.retries
      if (event.block) {
        agg.blockCount += 1
        agg.blockAgents.add(session.agentId)
      }
      if (event.errorKind) {
        agg.errorKindCount[event.errorKind] = (agg.errorKindCount[event.errorKind] ?? 0) + 1
      }
      if (typeof event.httpStatus === "number") {
        agg.httpStatusCount[event.httpStatus] = (agg.httpStatusCount[event.httpStatus] ?? 0) + 1
      }
      agg.agentIds.add(session.agentId)
      cellAgg.set(key, agg)

      totalEventCount += 1
      totalDwellSum += event.dwellMs
    }
  }

  const avgDwellMs = totalEventCount > 0 ? totalDwellSum / totalEventCount : 0
  const heat = new Float32Array(HEATMAP_GRID_COLS * HEATMAP_GRID_ROWS)

  for (const [key, agg] of cellAgg.entries()) {
    const perEventRetries = agg.eventCount > 0 ? agg.retriesSum / agg.eventCount : 0
    const perEventDwell = agg.eventCount > 0 ? agg.dwellSum / agg.eventCount : 0
    const repeatFactor = clamp(perEventRetries / 3, 0, 1)
    const dwellFactor = avgDwellMs > 0 ? clamp(perEventDwell / avgDwellMs / 2, 0, 1) : 0
    const blockFactor = agg.agentIds.size > 0 ? clamp(agg.blockAgents.size / agg.agentIds.size, 0, 1) : 0
    heat[key] = clamp(blockFactor * 0.85 + repeatFactor * 0.15 + dwellFactor * 0.1, 0, 1)
  }

  const cells = new Map<number, HeatmapCellSummary>()
  for (const [key, agg] of cellAgg.entries()) {
    const col = key % HEATMAP_GRID_COLS
    const row = Math.floor(key / HEATMAP_GRID_COLS)
    const impactedAgents = agg.agentIds.size
    const blockRate = impactedAgents > 0 ? agg.blockAgents.size / impactedAgents : 0
    const avgRetries = agg.eventCount > 0 ? agg.retriesSum / agg.eventCount : 0
    const score = heat[key] ?? 0
    if (score <= 0) continue

    const topHttpStatuses = Object.entries(agg.httpStatusCount)
      .map(([status, count]) => ({ status: Number(status), count }))
      .filter((item) => Number.isFinite(item.status) && item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)

    cells.set(key, {
      key,
      x: (col + 0.5) / HEATMAP_GRID_COLS,
      y: (row + 0.5) / HEATMAP_GRID_ROWS,
      score,
      impactedAgents,
      avgRetries,
      blockRate,
      errors: {
        timeout: agg.errorKindCount.timeout ?? 0,
        console: agg.errorKindCount.console ?? 0,
        network: agg.errorKindCount.network ?? 0,
        topHttpStatuses,
      },
    })
  }

  const hotspots: HeatmapHotspot[] = Array.from(cellAgg.entries())
    .map(([key, agg]) => {
      const col = key % HEATMAP_GRID_COLS
      const row = Math.floor(key / HEATMAP_GRID_COLS)
      const impactedAgents = agg.agentIds.size
      const blockRate = impactedAgents > 0 ? agg.blockAgents.size / impactedAgents : 0
      const avgRetries = agg.eventCount > 0 ? agg.retriesSum / agg.eventCount : 0
      const score = heat[key] ?? 0
      const summary = cells.get(key)

      return {
        id: `hs-${col}-${row}`,
        rank: 0,
        x: (col + 0.5) / HEATMAP_GRID_COLS,
        y: (row + 0.5) / HEATMAP_GRID_ROWS,
        score,
        impactedAgents,
        avgRetries,
        blockRate,
        errors: {
          timeout: summary?.errors.timeout ?? 0,
          console: summary?.errors.console ?? 0,
          network: summary?.errors.network ?? 0,
          topHttpStatuses: summary?.errors.topHttpStatuses ?? [],
        },
      }
    })
    .filter((spot) => spot.impactedAgents >= 8 && spot.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((spot, index) => ({ ...spot, rank: index + 1 }))

  return {
    heat,
    cells,
    hotspots,
    markers: hotspots.length ? hotspots : buildFallbackHotspots(cells, 6),
    totals: {
      agentCount: totalAgents.size,
      eventCount: totalEventCount,
    },
  }
}
