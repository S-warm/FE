import { useEffect, useMemo, useRef, useState } from "react"

import { Info } from "lucide-react"

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
import { heatmapAgeBands, defaultHeatmapPageId } from "@/mocks/result-heatmap.mock"
import type { HeatmapAgeBand } from "@/mocks/result-heatmap.mock"
import { heatmapPageLogsMock, heatmapTimelineMaxMsMock } from "@/mocks/result-heatmap-log.mock"
import type { HeatmapAgentSession, HeatmapLogEvent, HeatmapPageLogMock } from "@/mocks/result-heatmap-log.mock"
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
      }

      agg.eventCount += 1
      agg.dwellSum += event.dwellMs
      agg.retriesSum += event.retries
      if (event.block) {
        agg.blockCount += 1
        agg.blockAgents.add(session.agentId)
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

  const hotspots: HeatmapHotspot[] = Array.from(cellAgg.entries())
    .map(([key, agg]) => {
      const col = key % GRID_COLS
      const row = Math.floor(key / GRID_COLS)
      const impactedAgents = agg.agentIds.size
      const blockRate = impactedAgents > 0 ? agg.blockAgents.size / impactedAgents : 0
      const avgRetries = agg.eventCount > 0 ? agg.retriesSum / agg.eventCount : 0
      const score = heat[key] ?? 0
      return {
        id: `hs-${col}-${row}`,
        rank: 0,
        x: (col + 0.5) / GRID_COLS,
        y: (row + 0.5) / GRID_ROWS,
        score,
        impactedAgents,
        avgRetries,
        blockRate,
      }
    })
    .filter((spot) => spot.impactedAgents >= 8 && spot.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((spot, index) => ({ ...spot, rank: index + 1 }))

  return {
    heat,
    hotspots,
    totals: {
      agentCount: totalAgents.size,
      eventCount: totalEventCount,
    },
  }
}

function scoreToFill(score: number) {
  const clamped = clamp(score, 0, 1)
  const hue = 46 - 46 * clamped // yellow -> red (errors-only)
  const alpha = Math.min(0.95, 0.12 + clamped * 0.85)
  return `hsla(${hue}, 92%, 54%, ${alpha})`
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

  const hoveredHotspot = useMemo(
    () => analysis.hotspots.find((spot) => spot.id === hoveredHotspotId) ?? null,
    [analysis.hotspots, hoveredHotspotId]
  )

  const openHotspot = useMemo(
    () => analysis.hotspots.find((spot) => spot.id === openHotspotId) ?? null,
    [analysis.hotspots, openHotspotId]
  )

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

    const drawHeat = (blurPx: number, alphaScale: number) => {
      context.save()
      context.filter = `blur(${blurPx}px)`
      context.globalAlpha = clamp(overlayOpacity * alphaScale, 0, 1)
      for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLS; col += 1) {
          const score = analysis.heat[cellKey(col, row)] ?? 0
          if (score <= 0) continue
          context.fillStyle = scoreToFill(score)
          context.fillRect(col * cellW, row * cellH, cellW, cellH)
        }
      }
      context.restore()
    }

    drawHeat(18, 0.8)
    drawHeat(7, 1)
  }, [analysis.heat, baseSize, overlayOpacity])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-card h-[clamp(560px,72vh,920px)]">
      <div ref={viewportRef} className="grid h-full w-full place-items-center bg-surface-subtle p-6">
        <div
          className="relative overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm"
          style={baseSize ? { width: `${baseSize.width}px`, height: `${baseSize.height}px` } : undefined}
        >
          <img
            src={screenshotUrl}
            alt="페이지 스크린샷"
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
            onLoad={(event) => {
              const img = event.currentTarget
              if (img.naturalWidth && img.naturalHeight) {
                setImageAspect(img.naturalWidth / img.naturalHeight)
              }
            }}
          />

          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="absolute inset-0">
            {analysis.hotspots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[12px] font-semibold shadow-sm transition-transform",
                  spot.score >= 0.75
                    ? "border-critical-accent/40 bg-danger-surface text-critical-text"
                    : spot.score >= 0.55
                      ? "border-moderate-accent/50 bg-warning-surface text-moderate-text"
                      : "border-border-soft-2 bg-surface-muted text-text-secondary",
                  hoveredHotspotId === spot.id ? "scale-110 ring-4 ring-text-link/20" : "scale-100"
                )}
                style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                onMouseEnter={() => setHoveredHotspotId(spot.id)}
                onMouseLeave={() => setHoveredHotspotId(null)}
                onClick={() => setOpenHotspotId(spot.id)}
                aria-label={`핫스팟 ${spot.rank}`}
              >
                {spot.rank}
              </button>
            ))}
          </div>

          {hoveredHotspot ? (
            <div
              className="pointer-events-none absolute z-10 w-[240px] -translate-x-1/2 rounded-2xl border border-border-soft bg-card/95 p-3 shadow-sm backdrop-blur-sm"
              style={{
                left: `${hoveredHotspot.x * 100}%`,
                top: `${hoveredHotspot.y * 100}%`,
                marginTop: "-48px",
              }}
              aria-hidden="true"
            >
              <p className="text-caption-12-medium text-text-secondary">핫스팟 #{hoveredHotspot.rank}</p>
              <div className="mt-2 grid gap-1 text-caption-12-regular text-text-muted">
                <p>영향 받은 테스터: {hoveredHotspot.impactedAgents.toLocaleString()}명</p>
                <p>평균 반복 횟수: {hoveredHotspot.avgRetries.toFixed(1)}회</p>
                <p>이탈/블락율: {(hoveredHotspot.blockRate * 100).toFixed(0)}%</p>
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
  const [expandedPageId, setExpandedPageId] = useState<string>(defaultHeatmapPageId)
  const [ageFilter, setAgeFilter] = useState<HeatmapAgeBand | "all">("all")
  const [overlayOpacity, setOverlayOpacity] = useState(85)

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

  useEffect(() => {
    setExpandedPageId(selectedPageId)
  }, [selectedPageId])

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
        expandedPageId={expandedPageId}
        onSelectPage={(pageId) => {
          setSelectedPageId(pageId)
          setExpandedPageId(pageId)
        }}
        onExpandPage={setExpandedPageId}
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
                <span className="size-2 rounded-full bg-[hsla(120,92%,54%,0.7)]" aria-hidden="true" />
                낮음
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <span className="size-2 rounded-full bg-[hsla(60,92%,54%,0.7)]" aria-hidden="true" />
                보통
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <span className="size-2 rounded-full bg-[hsla(30,92%,54%,0.7)]" aria-hidden="true" />
                높음
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <span className="size-2 rounded-full bg-[hsla(0,92%,54%,0.7)]" aria-hidden="true" />
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
