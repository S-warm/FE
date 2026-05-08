import { useEffect, useMemo, useRef, useState } from "react"

import { Info, TriangleAlert } from "lucide-react"

import { IssueBadge } from "@/components/atoms"
import { SettingSlider } from "@/components/forms/setting-slider"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { heatmapAgeBands, defaultHeatmapPageId } from "@/mocks/result-heatmap.mock"
import type { HeatmapAgeBand } from "@/mocks/result-heatmap.mock"
import { heatmapPageLogsMock, heatmapTimelineMaxMsMock } from "@/mocks/result-heatmap-log.mock"
import type { HeatmapAgentSession, HeatmapErrorKind, HeatmapLogEvent, HeatmapPageLogMock } from "@/mocks/result-heatmap-log.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"

const GRID_COLS = 64
const GRID_ROWS = 40

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function selectErrorEvents(events: HeatmapLogEvent[]) {
  return events.filter((event) => event.block || Boolean(event.errorKind))
}

function cellKey(col: number, row: number) {
  return row * GRID_COLS + col
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

interface HeatmapCellSummary {
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

interface HeatmapHotspot {
  id: string
  rank: number
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

function buildFallbackHotspots(cells: Map<number, HeatmapCellSummary>, limit: number) {
  const sorted = Array.from(cells.values()).sort((a, b) => {
      const scoreDelta = b.score - a.score
      if (Math.abs(scoreDelta) > 0.0001) return scoreDelta
      return b.impactedAgents - a.impactedAgents
    })

  const preferred = sorted.filter((cell) => cell.score >= 0.18)
  const pool = preferred.length ? preferred : sorted

  const picked: Array<{ col: number; row: number; cell: HeatmapCellSummary }> = []
  const minDistance = 9

  for (const cell of pool) {
    if (picked.length >= limit) break

    const col = cell.key % GRID_COLS
    const row = Math.floor(cell.key / GRID_COLS)
    const tooClose = picked.some((item) => Math.hypot(item.col - col, item.row - row) < minDistance)
    if (tooClose) continue

    picked.push({ col, row, cell })
  }

  if (picked.length === 0 && sorted.length) {
    const first = sorted[0]
    const col = first.key % GRID_COLS
    const row = Math.floor(first.key / GRID_COLS)
    picked.push({ col, row, cell: first })
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

function analyzeSessions({
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

      const col = clamp(Math.floor(event.x * GRID_COLS), 0, GRID_COLS - 1)
      const row = clamp(Math.floor(event.y * GRID_ROWS), 0, GRID_ROWS - 1)
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
  const heat = new Float32Array(GRID_COLS * GRID_ROWS)

  for (const [key, agg] of cellAgg.entries()) {
    const perEventRetries = agg.eventCount > 0 ? agg.retriesSum / agg.eventCount : 0
    const perEventDwell = agg.eventCount > 0 ? agg.dwellSum / agg.eventCount : 0
    const repeatFactor = clamp(perEventRetries / 3, 0, 1)
    const dwellFactor = avgDwellMs > 0 ? clamp(perEventDwell / avgDwellMs / 2, 0, 1) : 0
    const blockFactor = agg.agentIds.size > 0 ? clamp(agg.blockAgents.size / agg.agentIds.size, 0, 1) : 0

    const score = clamp(blockFactor * 0.85 + repeatFactor * 0.15 + dwellFactor * 0.1, 0, 1)

    heat[key] = score
  }

  const cells = new Map<number, HeatmapCellSummary>()
  for (const [key, agg] of cellAgg.entries()) {
    const col = key % GRID_COLS
    const row = Math.floor(key / GRID_COLS)
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
      x: (col + 0.5) / GRID_COLS,
      y: (row + 0.5) / GRID_ROWS,
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
      const col = key % GRID_COLS
      const row = Math.floor(key / GRID_COLS)
      const impactedAgents = agg.agentIds.size
      const blockRate = impactedAgents > 0 ? agg.blockAgents.size / impactedAgents : 0
      const avgRetries = agg.eventCount > 0 ? agg.retriesSum / agg.eventCount : 0
      const score = heat[key] ?? 0
      const summary = cells.get(key)
      return {
        id: `hs-${col}-${row}`,
        rank: 0,
        x: (col + 0.5) / GRID_COLS,
        y: (row + 0.5) / GRID_ROWS,
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

  const fallbackHotspots = buildFallbackHotspots(cells, 6)
  const markers = hotspots.length ? hotspots : fallbackHotspots

  return {
    heat,
    cells,
    hotspots,
    markers,
    totals: {
      agentCount: totalAgents.size,
      eventCount: totalEventCount,
    },
  }
}

function scoreToFill(score: number) {
  const clamped = clamp(score, 0, 1)
  const hue = 46 - 46 * clamped // yellow -> red (errors-only)
  const alpha = Math.min(0.7, 0.05 + clamped * 0.45)
  return `hsla(${hue}, 92%, 54%, ${alpha})`
}

function spotlightGradient({
  xPercent,
  yPercent,
  radiusPx,
}: {
  xPercent: number
  yPercent: number
  radiusPx: number
}) {
  const inner = Math.max(12, Math.round(radiusPx * 0.55))
  const outer = Math.max(inner + 12, Math.round(radiusPx))
  const color = "var(--color-heatmap-spotlight)"
  return `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(15, 23, 42, 0) 0px, rgba(15, 23, 42, 0) ${inner}px, ${color} ${outer}px, ${color} 100%)`
}

function hotspotSeverity(score: number) {
  if (score >= 0.72) return { badgeVariant: "error" as const, label: "치명적" }
  if (score >= 0.52) return { badgeVariant: "warning" as const, label: "높음" }
  return { badgeVariant: "info" as const, label: "보통" }
}

function hotspotMarkerStyle(score: number) {
  if (score >= 0.72) {
    return "border-critical-accent/40 bg-danger-surface/90 text-danger-text shadow-[var(--shadow-heatmap-critical)]"
  }
  if (score >= 0.52) {
    return "border-moderate-accent/50 bg-warning-surface/90 text-warning-text shadow-[var(--shadow-heatmap-warning)]"
  }
  return "border-border-soft-2 bg-brand-subtle/90 text-text-link shadow-[var(--shadow-heatmap-info)]"
}

function primaryErrorKind(errors: { timeout: number; network: number; console: number }) {
  const entries = [
    ["timeout", errors.timeout],
    ["network", errors.network],
    ["console", errors.console],
  ] as const

  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? "timeout"
}

function errorKindLabel(kind: "timeout" | "network" | "console") {
  if (kind === "timeout") return "Timeout"
  if (kind === "network") return "Network"
  return "Console"
}

function HeatmapLogCanvas({
  screenshotUrl,
  sessions,
  timeEndMs,
  overlayOpacity,
}: {
  screenshotUrl: string
  sessions: HeatmapAgentSession[]
  timeEndMs: number
  overlayOpacity: number
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [imageAspect, setImageAspect] = useState<number>(1400 / 880)
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null)
  const [openHotspotId, setOpenHotspotId] = useState<string | null>(null)
  const [spotlightCenter, setSpotlightCenter] = useState<{ xPercent: number; yPercent: number } | null>(null)
  const [spotlightVisible, setSpotlightVisible] = useState(false)

  useEffect(() => {
    if (!viewportRef.current) return
    const element = viewportRef.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setViewportSize({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const baseSize = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height || !Number.isFinite(imageAspect) || imageAspect <= 0) return null

    const padding = 24
    const maxWidth = Math.max(0, viewportSize.width - padding * 2)
    const maxHeight = Math.max(0, viewportSize.height - padding * 2)

    let width = maxWidth
    let height = width / imageAspect
    if (height > maxHeight) {
      height = maxHeight
      width = height * imageAspect
    }

    return { width, height }
  }, [viewportSize.width, viewportSize.height, imageAspect])

  const analysis = useMemo(
    () => analyzeSessions({ sessions, timeEndMs }),
    [sessions, timeEndMs]
  )

  const markerSpots = useMemo(() => analysis.markers, [analysis.markers])

  const hoveredHotspot = useMemo(
    () => markerSpots.find((spot) => spot.id === hoveredHotspotId) ?? null,
    [markerSpots, hoveredHotspotId]
  )

  const openHotspot = useMemo(
    () => markerSpots.find((spot) => spot.id === openHotspotId) ?? null,
    [markerSpots, openHotspotId]
  )

  const spotlightBg = useMemo(() => {
    if (!spotlightCenter || !baseSize) return null
    const radius = Math.max(140, Math.min(baseSize.width, baseSize.height) * 0.22)
    return spotlightGradient({
      xPercent: spotlightCenter.xPercent,
      yPercent: spotlightCenter.yPercent,
      radiusPx: radius,
    })
  }, [baseSize, spotlightCenter])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !baseSize) return
    const context = canvas.getContext("2d")
    if (!context) return

    const dpr = window.devicePixelRatio || 1
    const width = baseSize.width
    const height = baseSize.height

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, width, height)

    const cellW = width / GRID_COLS
    const cellH = height / GRID_ROWS

    const drawHeat = (blurPx: number, alphaScale: number, spreadScale: number) => {
      context.save()
      context.filter = `blur(${blurPx}px)`
      context.globalAlpha = clamp(overlayOpacity * alphaScale, 0, 1)
      for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLS; col += 1) {
          const score = analysis.heat[cellKey(col, row)] ?? 0
          if (score <= 0) continue
          context.fillStyle = scoreToFill(score)
          const spreadX = cellW * spreadScale
          const spreadY = cellH * spreadScale
          context.fillRect(col * cellW - spreadX / 2, row * cellH - spreadY / 2, cellW + spreadX, cellH + spreadY)
        }
      }
      context.restore()
    }

    drawHeat(22, 0.55, 1.1)
    drawHeat(10, 0.65, 0.7)
  }, [analysis.heat, baseSize, overlayOpacity])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-card h-[clamp(560px,72vh,920px)]">
      <div ref={viewportRef} className="grid h-full w-full place-items-center bg-surface-subtle p-6">
        <div
          className="relative overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm"
          style={baseSize ? { width: `${baseSize.width}px`, height: `${baseSize.height}px` } : undefined}
          onMouseLeave={() => {
            setHoveredHotspotId(null)
            setSpotlightVisible(false)
          }}
        >
          <img
            src={screenshotUrl}
            alt="페이지 스크린샷"
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover opacity-80"
            onLoad={(event) => {
              const img = event.currentTarget
              if (img.naturalWidth && img.naturalHeight) {
                setImageAspect(img.naturalWidth / img.naturalHeight)
              }
            }}
          />

          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

          {spotlightBg ? (
            <div
              className="pointer-events-none absolute inset-0 z-[1] will-change-[opacity] transition-opacity duration-450 ease-out"
              style={{ background: spotlightBg, opacity: spotlightVisible ? 1 : 0 }}
              aria-hidden="true"
            />
          ) : null}

          <div className="absolute inset-0 z-[2] pointer-events-none">
            {markerSpots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                className={cn(
                  "group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 transition-transform",
                  "after:absolute after:-inset-3 after:content-['']",
                  hoveredHotspotId === spot.id ? "scale-110" : "scale-100"
                )}
                style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                onMouseEnter={() => {
                  setHoveredHotspotId(spot.id)
                  setSpotlightCenter({ xPercent: spot.x * 100, yPercent: spot.y * 100 })
                  setSpotlightVisible(true)
                }}
                onMouseLeave={() => {
                  setHoveredHotspotId(null)
                  setSpotlightVisible(false)
                }}
                onClick={() => setOpenHotspotId(spot.id)}
                aria-label={`핫스팟 ${spot.rank}`}
              >
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-full border backdrop-blur-sm transition-shadow",
                    hotspotMarkerStyle(spot.score),
                    "group-hover:ring-4 group-hover:ring-text-link/10"
                  )}
                >
                  <TriangleAlert className="size-5" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>

          {hoveredHotspot ? (
            <div
              className="pointer-events-none absolute z-10 w-[320px] -translate-x-1/2 rounded-2xl border border-border-soft bg-card/95 p-4 shadow-sm backdrop-blur-sm"
              style={{
                left: `${hoveredHotspot.x * 100}%`,
                top: `${hoveredHotspot.y * 100}%`,
                marginTop: "-48px",
              }}
              aria-hidden="true"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl bg-danger-surface text-danger-text">
                  <TriangleAlert className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body-14-medium text-text-body">오류 집중 지점</p>
                    <IssueBadge variant={hotspotSeverity(hoveredHotspot.score).badgeVariant} size="sm">
                      {hotspotSeverity(hoveredHotspot.score).label}
                    </IssueBadge>
                    <span className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2 text-[11px] font-medium text-text-secondary">
                      {errorKindLabel(primaryErrorKind(hoveredHotspot.errors))}
                    </span>
                  </div>
                  <p className="mt-1 text-caption-12-regular text-text-subtle">
                    {hoveredHotspot.impactedAgents.toLocaleString()}명 영향 · 블락 {(hoveredHotspot.blockRate * 100).toFixed(0)}% · 반복{" "}
                    {hoveredHotspot.avgRetries.toFixed(1)}회
                  </p>
                </div>
              </div>

              <p className="mt-3 text-caption-12-regular text-text-muted">
                클릭/스텝 로그에서 Timeout·Network·Console 오류가 집중된 구간입니다. 주변 UI에서 반복 시도/지연이 발생합니다.
              </p>

              <div className="mt-3 grid gap-1">
                <p className="text-caption-12-medium text-text-subtle">오류 상세</p>
                <code className="w-fit rounded-xl bg-surface-muted px-3 py-2 text-[12px] text-text-body">
                  timeout {hoveredHotspot.errors.timeout} · network {hoveredHotspot.errors.network} · console{" "}
                  {hoveredHotspot.errors.console}
                  {hoveredHotspot.errors.topHttpStatuses.length
                    ? ` · HTTP ${hoveredHotspot.errors.topHttpStatuses.map((item) => `${item.status}(${item.count})`).join("·")}`
                    : ""}
                </code>
              </div>
            </div>
          ) : null}

          <Dialog open={Boolean(openHotspot)} onOpenChange={(open) => (!open ? setOpenHotspotId(null) : null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>핫스팟 상세</DialogTitle>
                <DialogDescription>선택한 지점에서 AI 테스터가 헤매거나 블락된 패턴을 요약합니다.</DialogDescription>
              </DialogHeader>
              {openHotspot ? (
                <div className="grid gap-2 rounded-2xl border border-border-soft bg-surface-subtle p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-body-14-medium text-text-body">핫스팟 #{openHotspot.rank}</p>
                    <span className="text-caption-12-medium text-text-muted">Score {openHotspot.score.toFixed(2)}</span>
                  </div>
                  <div className="grid gap-1 text-caption-12-regular text-text-muted">
                    <p>영향 받은 테스터: {openHotspot.impactedAgents.toLocaleString()}명</p>
                    <p>평균 반복 횟수: {openHotspot.avgRetries.toFixed(1)}회</p>
                    <p>이탈/블락율: {(openHotspot.blockRate * 100).toFixed(0)}%</p>
                    <p className="pt-1 text-caption-12-regular text-text-subtle">
                      팁: 타임라인을 줄이거나 누적 모드를 켜서 병목이 생기는 구간을 먼저 좁혀보세요.
                    </p>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

function ResultHeatmapPage() {
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const { expandedPageIds, expandPage } = useResultPageSidePanelState(selectedPageId, [defaultHeatmapPageId])
  const [ageFilter, setAgeFilter] = useState<HeatmapAgeBand | "all">("all")
  const [overlayOpacity, setOverlayOpacity] = useState(60)

  const selectedLog: HeatmapPageLogMock =
    heatmapPageLogsMock.find((page) => page.pageId === selectedPageId) ?? heatmapPageLogsMock[0]

  const sidePages = useMemo(
    () =>
      resultPagesMock.map((page) => {
        const log = heatmapPageLogsMock.find((item) => item.pageId === page.id)
        const agentCount = log?.sessions.length ?? 0
        return {
          id: page.id,
          name: page.name,
          screenshotUrl: page.screenshotUrl,
          metaText: `${agentCount.toLocaleString()}명 AI 로그`,
        }
      }),
    []
  )

  const resolvedTimeEndMs = heatmapTimelineMaxMsMock

  const filteredSessions = useMemo(() => {
    if (!selectedLog) return []
    if (ageFilter === "all") return selectedLog.sessions
    return selectedLog.sessions.filter((session) => session.ageBand === ageFilter)
  }, [ageFilter, selectedLog])

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageIds={expandedPageIds}
        onSelectPage={(pageId) => {
          setSelectedPageId(pageId)
          expandPage(pageId)
        }}
        onExpandPage={expandPage}
      />

      <div className="grid gap-4">
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-body-14-medium text-text-body">오류 집중 구간 히트맵</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-surface-subtle px-2 py-1 text-caption-12-regular text-text-muted">
                    <Info className="size-3.5" />
                    정규화 좌표(0~1) + Step 로그
                  </span>
                </div>
                <p className="text-caption-12-regular text-text-subtle">
                  Timeout·Console·Network 기반 블락/오류 신호를 “강도”로 집계해 병목 구간을 찾습니다.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-caption-12-regular text-text-muted">
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <span className="size-2 rounded-full bg-[var(--color-heatmap-low)]" aria-hidden="true" />
                낮음
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <span className="size-2 rounded-full bg-[var(--color-heatmap-medium)]" aria-hidden="true" />
                보통
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <span className="size-2 rounded-full bg-[var(--color-heatmap-high)]" aria-hidden="true" />
                높음
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <span className="size-2 rounded-full bg-[var(--color-heatmap-critical)]" aria-hidden="true" />
                치명적(블락)
              </span>
            </div>

            <HeatmapLogCanvas
              screenshotUrl={selectedLog.screenshotUrl}
              sessions={filteredSessions}
              timeEndMs={resolvedTimeEndMs}
              overlayOpacity={overlayOpacity / 100}
            />

            <div className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-subtle p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid gap-1">
                  <p className="text-caption-12-medium text-text-secondary">연령대 필터</p>
                  <p className="text-caption-12-regular text-text-muted">레이아웃이 달라도 상대 좌표(0~1)로 동일 기준 분석</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAgeFilter("all")}
                  className={cn(
                    "h-10 rounded-xl border px-4 text-body-14-medium transition-colors",
                    ageFilter === "all"
                      ? "border-border-soft-2 bg-surface-muted text-text-strong hover:bg-surface-muted-hover"
                      : "border-border-soft bg-card text-text-muted hover:bg-surface-hover-2 hover:text-text-strong"
                  )}
                >
                  전체
                </button>
                {heatmapAgeBands.map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => setAgeFilter(band)}
                    className={cn(
                      "h-10 rounded-xl border px-4 text-body-14-medium transition-colors",
                      ageFilter === band
                        ? "border-border-soft-2 bg-surface-muted text-text-strong hover:bg-surface-muted-hover"
                        : "border-border-soft bg-card text-text-muted hover:bg-surface-hover-2 hover:text-text-strong"
                    )}
                  >
                    {band}
                  </button>
                ))}
              </div>

              <SettingSlider
                label="오류 오버레이 강도"
                value={overlayOpacity}
                min={30}
                max={100}
                step={1}
                unit="%"
                size="sm"
                onChange={setOverlayOpacity}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultHeatmapPage
