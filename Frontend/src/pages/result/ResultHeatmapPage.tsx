import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Info } from "lucide-react"

import { IssueBadge } from "@/components/atoms"
import { EmptyState } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
import { motion } from "@/lib/motion"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { cn } from "@/lib/utils"
import { useResultHeatmapQuery } from "@/queries"
import type { ResultAgeFilter } from "@/types/view-model/common/result-meta"
import type {
  ResultHeatmapCoordinateMode,
  ResultHeatmapPageViewModel,
  ResultHeatmapPointViewModel,
} from "@/types/view-model/result/result-heatmap"

const ageFilters: ResultAgeFilter[] = [
  "all",
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대",
  "70대",
]

function getPointBadgeVariant(point: ResultHeatmapPointViewModel) {
  const tone = point.severity.tone
  return tone === "neutral" ? "info" : tone
}

function getMarkerColor(point: ResultHeatmapPointViewModel) {
  void point
  return "bg-slate-950/78"
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

interface RenderedImageMetrics {
  displayWidth: number
  displayHeight: number
  naturalWidth: number
  naturalHeight: number
}

function clampRatio(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function resolvePointRatios(
  point: Pick<ResultHeatmapPointViewModel, "x" | "y">,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
) {
  const { x, y } = point

  if (coordinateMode === "ratio") {
    return {
      xRatio: clampRatio(x),
      yRatio: clampRatio(y),
    }
  }

  if (coordinateMode === "percent") {
    return {
      xRatio: clampRatio(x / 100),
      yRatio: clampRatio(y / 100),
    }
  }

  if (
    coordinateMode === "pixel-scaled-thousand" &&
    metrics.naturalWidth > 0 &&
    metrics.naturalHeight > 0
  ) {
    return {
      xRatio: clampRatio((x * 1000) / metrics.naturalWidth),
      yRatio: clampRatio((y * 1000) / metrics.naturalHeight),
    }
  }

  if (coordinateMode === "pixel" && metrics.naturalWidth > 0 && metrics.naturalHeight > 0) {
    return {
      xRatio: clampRatio(x / metrics.naturalWidth),
      yRatio: clampRatio(y / metrics.naturalHeight),
    }
  }

  return {
    xRatio: 0,
    yRatio: 0,
  }
}

function resolvePointPixels(
  point: Pick<ResultHeatmapPointViewModel, "x" | "y">,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
) {
  const { xRatio, yRatio } = resolvePointRatios(point, metrics, coordinateMode)

  return {
    xRatio,
    yRatio,
    left: xRatio * metrics.displayWidth,
    top: yRatio * metrics.displayHeight,
  }
}

function getSeverityWeight(point: ResultHeatmapPointViewModel) {
  if (point.severity.rank >= 4) return 1.5
  if (point.severity.rank >= 2) return 1.15
  return 0.9
}

function getHeatScore(point: ResultHeatmapPointViewModel, maxCount: number) {
  const countRatio = point.count / Math.max(maxCount, 1)
  const severityRatio = Math.min(1, getSeverityWeight(point) / 1.5)
  return Math.min(1, countRatio * 0.72 + severityRatio * 0.28)
}

function getHeatColor(score: number) {
  if (score >= 0.72) return "239, 68, 68"
  if (score >= 0.42) return "249, 115, 22"
  return "34, 197, 94"
}

function getHeatRadius(point: ResultHeatmapPointViewModel, maxCount: number) {
  const countRatio = point.count / Math.max(maxCount, 1)
  return 68 + countRatio * 76 + getSeverityWeight(point) * 28
}

function getHeatAlpha(
  point: ResultHeatmapPointViewModel,
  maxCount: number,
) {
  const score = getHeatScore(point, maxCount)
  return 0.24 + score * 0.5
}

function drawHeatmapLayer(
  canvas: HTMLCanvasElement,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
  points: ResultHeatmapPointViewModel[],
) {
  const { displayWidth: width, displayHeight: height } = metrics
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const maxCount = Math.max(...points.map((point) => point.count), 1)

  points.forEach((point) => {
    const { left: x, top: y } = resolvePointPixels(point, metrics, coordinateMode)
    const radius = getHeatRadius(point, maxCount)
    const alpha = getHeatAlpha(point, maxCount)
    const score = getHeatScore(point, maxCount)
    const color = getHeatColor(score)

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(${color}, ${Math.min(alpha * 1.18, 0.92)})`)
    gradient.addColorStop(0.14, `rgba(${color}, ${Math.min(alpha * 1.02, 0.84)})`)
    gradient.addColorStop(0.34, `rgba(${color}, ${alpha * 0.72})`)
    gradient.addColorStop(0.58, `rgba(${color}, ${alpha * 0.34})`)
    gradient.addColorStop(0.82, `rgba(${color}, ${alpha * 0.1})`)
    gradient.addColorStop(1, `rgba(${color}, 0)`)

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  })
}

function HeatmapCanvas({
  page,
  selectedPointId,
  onSelectPoint,
  hoveredPointId,
  onHoverPoint,
}: {
  page: ResultHeatmapPageViewModel
  selectedPointId: string | null
  onSelectPoint: (issueId: string) => void
  hoveredPointId: string | null
  onHoverPoint: (issueId: string | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failedScreenshotUrl, setFailedScreenshotUrl] = useState<string | null>(null)
  const [imageMetrics, setImageMetrics] = useState<RenderedImageMetrics | null>(null)

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    setImageMetrics({
      displayWidth: image.clientWidth,
      displayHeight: image.clientHeight,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    })
  }

  useEffect(() => {
    const updateMetrics = () => {
      const image = imageRef.current
      if (!image) return

      setImageMetrics({
        displayWidth: image.clientWidth,
        displayHeight: image.clientHeight,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })
    }

    updateMetrics()

    const image = imageRef.current
    if (!image || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateMetrics)
      return () => {
        window.removeEventListener("resize", updateMetrics)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics()
    })

    resizeObserver.observe(image)

    return () => {
      resizeObserver.disconnect()
    }
  }, [page.pageId])

  useEffect(() => {
    if (!canvasRef.current || !imageMetrics) return

    drawHeatmapLayer(
      canvasRef.current,
      imageMetrics,
      page.coordinateMode,
      page.points,
    )
  }, [imageMetrics, page.coordinateMode, page.points])

  const getTooltipPosition = (point: Pick<ResultHeatmapPointViewModel, "x" | "y">) => {
    const imageRect = imageRef.current?.getBoundingClientRect()
    if (!imageRect || !imageMetrics) {
      return { x: 0, y: 0 }
    }

    const { left, top } = resolvePointPixels(point, imageMetrics, page.coordinateMode)

    return {
      x: imageRect.left + left,
      y: imageRect.top + top,
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto rounded-2xl border border-border-strong bg-card"
      style={{ maxHeight: "80vh" }}
    >
      {page.screenshotUrl && failedScreenshotUrl !== page.screenshotUrl ? (
        <div ref={contentRef} className="relative w-full">
          <img
            ref={imageRef}
            src={page.screenshotUrl}
            alt={page.pageName}
            className="block w-full h-auto"
            onLoad={handleImageLoad}
            onError={() => setFailedScreenshotUrl(page.screenshotUrl ?? null)}
          />

          {imageMetrics ? (
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute left-0 top-0 z-[1] opacity-100"
              style={{
                width: `${imageMetrics.displayWidth}px`,
                height: `${imageMetrics.displayHeight}px`,
              }}
            />
          ) : null}

          {imageMetrics ? (
            <div
              className="pointer-events-none absolute left-0 top-0 z-[3]"
              style={{
                width: `${imageMetrics.displayWidth}px`,
                height: `${imageMetrics.displayHeight}px`,
              }}
            >
              {page.points.map((point, index) => {
                const isSelected = point.issueId === selectedPointId
                const isHovered = point.issueId === hoveredPointId
                const uniqueKey = `${page.pageUrl}-${point.issueId}-${index}`
                const position = resolvePointPixels(point, imageMetrics, page.coordinateMode)
                const tooltipPosition = getTooltipPosition(point)

                return (
                  <div key={uniqueKey}>
                    <div
                      className={cn(
                        "absolute rounded-full blur-[14px] transition-opacity duration-300",
                        getMarkerColor(point),
                        "opacity-14",
                      )}
                      style={{
                        left: `${position.left}px`,
                        top: `${position.top}px`,
                        width: `${10 + point.count * 2}px`,
                        height: `${10 + point.count * 2}px`,
                        transform: "translate(-50%, -50%)",
                        zIndex: isHovered ? 9 : 0,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => onSelectPoint(point.issueId)}
                      onMouseEnter={() => onHoverPoint(point.issueId)}
                      onMouseLeave={() => onHoverPoint(null)}
                      className={cn(
                        "pointer-events-auto absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/55 text-[11px] font-semibold text-white shadow-[0_6px_16px_rgba(15,23,42,0.32)] backdrop-blur-sm transition-all duration-300",
                        getMarkerColor(point),
                        isSelected ? "ring-3 ring-white/65" : "",
                        isHovered
                          ? "scale-110 ring-4 ring-white/90 shadow-2xl"
                          : "hover:scale-105",
                        "opacity-92",
                      )}
                      style={{
                        left: `${position.left}px`,
                        top: `${position.top}px`,
                        zIndex: isHovered ? 10 : 1,
                      }}
                      aria-label={`${point.issueId} ${point.description}`}
                    >
                      {point.count}
                    </button>

                    {isHovered ? (
                      <MarkerTooltip point={point} position={tooltipPosition} />
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid w-full place-items-center py-12">
          <p className="text-caption-12-regular text-text-muted">
            스크린샷이 없습니다
          </p>
        </div>
      )}
    </div>
  )
}

function MarkerTooltip({
  point,
  position,
}: {
  point: ResultHeatmapPointViewModel
  position: { x: number; y: number }
}) {
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipRect(tooltipRef.current.getBoundingClientRect())
    }
  }, [point.issueId])

  let left = position.x + 12
  let top = position.y - 50

  const tooltipWidth = tooltipRect?.width ?? 280
  const tooltipHeight = tooltipRect?.height ?? 100
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = 16

  if (left + tooltipWidth > viewportWidth - padding) {
    left = position.x - tooltipWidth - 12
  }

  if (top < padding) {
    top = position.y + 12
  }

  if (top + tooltipHeight > viewportHeight - padding) {
    top = position.y - tooltipHeight - 12
  }

  if (left < padding) {
    left = position.x + 12
  }

  return (
    <div
      ref={tooltipRef}
      className="pointer-events-none fixed z-70 max-w-xs rounded-xl border border-border-strong bg-white p-3 shadow-lg"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      <div className="grid gap-2">
        <div className="flex items-start gap-2">
          <IssueBadge variant={getPointBadgeVariant(point)} size="sm">
            {point.errorType}
          </IssueBadge>
          <p className="text-body-14-medium text-text-body">{point.issueId}</p>
        </div>
        <p className="text-caption-12-regular text-text-muted">{point.description}</p>
      </div>
    </div>
  )
}

function PointDetail({ point }: { point: ResultHeatmapPointViewModel | null }) {
  if (!point) {
    return (
      <EmptyState
        title="선택된 오류 포인트가 없습니다"
        description="스크린샷의 마커 또는 아래 목록에서 오류 포인트를 선택해 주세요."
      />
    )
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-card shadow-none",
        motion.card,
      )}
    >
      <CardContent className="grid gap-4 px-6 py-5">
        <div className="grid gap-3">
          <div>
            <p className="text-body-14-medium text-text-body">오류 상세 정보</p>
            <p className="mt-1 text-caption-12-regular text-text-muted">
              선택한 히트맵 포인트의 오류 상황과 분석 결과입니다. 차단율,
              반복 발생 횟수, 오류 타입 분포를 통해 문제의 심각도를 파악할 수
              있습니다.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <IssueBadge variant={getPointBadgeVariant(point)} size="sm">
                {point.errorType}
              </IssueBadge>
              <p className="text-body-14-medium text-text-body">{point.issueId}</p>
            </div>
            <p className="mb-2 text-caption-12-regular text-text-muted">
              {point.description}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-caption-12-medium text-text-secondary">
                포함 연령대 {point.ageBand === "all" ? "전체" : point.ageBand}
              </p>
              <div className="whitespace-nowrap rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary">
                영향 사용자 {point.affectedUsersCount}명
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">차단율</p>
            <p className="mt-1 text-body-14-medium text-text-body">
              {formatPercent(point.blockRate)}
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">반복 발생</p>
            <p className="mt-1 text-body-14-medium text-text-body">
              {point.repeatCount.toFixed(1)}회
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">오류 수</p>
            <p className="mt-1 text-body-14-medium text-text-body">{point.count}건</p>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-caption-12-medium text-text-secondary">오류 분포</p>
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-regular text-text-muted">Timeout</p>
              <p className="mt-1 text-body-14-medium text-text-body">
                {point.errorBreakdown.timeout}건
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-regular text-text-muted">Network</p>
              <p className="mt-1 text-body-14-medium text-text-body">
                {point.errorBreakdown.network}건
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-regular text-text-muted">Console</p>
              <p className="mt-1 text-body-14-medium text-text-body">
                {point.errorBreakdown.console}건
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultHeatmapPage() {
  const { simulationId } = useParams()
  const resolvedId = simulationId ?? "unknown"
  const [ageFilter, setAgeFilter] = useState<ResultAgeFilter>("all")
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)
  const { data, isLoading, isError, refetch } = useResultHeatmapQuery({
    simulationId: resolvedId,
    ageGroup: ageFilter,
    page: currentPageIndex,
    size: 12,
  })
  const pages = useMemo(() => data?.pages ?? [], [data])
  const pageIds = pages.map((page) => page.pageId)
  const { selectedPageId, setSelectedPageId } = useResultPageParam({
    availablePageIds: pageIds,
    defaultPageId: pageIds[0],
  })
  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(
    selectedPageId,
    pageIds,
  )

  const selectedPage = useMemo<ResultHeatmapPageViewModel | null>(
    () => pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId],
  )
  const selectedPoint = useMemo(() => {
    if (hoveredPointId) {
      return (
        selectedPage?.points.find((point) => point.issueId === hoveredPointId) ??
        null
      )
    }

    return (
      selectedPage?.points.find((point) => point.issueId === selectedPointId) ??
      selectedPage?.points[0] ??
      null
    )
  }, [selectedPage, selectedPointId, hoveredPointId])

  const sidePages = useMemo(
    () =>
      pages.map((page) => ({
        id: page.pageId,
        name: page.pageName,
        url: page.pageUrl,
        screenshotUrl: page.screenshotUrl || getResultPageScreenshotUrl(page.pageId),
      })),
    [pages],
  )

  if (isLoading) {
    return <ResultPageSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="히트맵 데이터를 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
        actionLabel="다시 시도"
        onAction={() => {
          void refetch()
        }}
      />
    )
  }

  if (!pages.length) {
    return (
      <EmptyState
        title="히트맵 데이터가 없습니다"
        description="선택한 시뮬레이션에 연결된 히트맵 데이터가 아직 없습니다."
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageIds={expandedPageIds}
        onSelectPage={(pageId) => {
          setSelectedPageId(pageId)
          setSelectedPointId(null)
          expandPage(pageId)
        }}
        onTogglePage={togglePage}
      />

      <div className="grid gap-4">
        <Card
          className={cn(
            "rounded-2xl border border-border-strong bg-card shadow-none",
            motion.card,
          )}
        >
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-body-14-medium text-text-body">히트맵 필터</p>
                <p className="text-caption-12-regular text-text-muted">
                  연령대와 페이지 데이터를 기준으로 집중된 오류 포인트를 확인합니다.
                </p>
              </div>
              <div className="rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary">
                {selectedPage?.metaText ?? "오류 포인트"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {ageFilters.map((filter) => {
                const active = ageFilter === filter
                return (
                  <button
                    key={filter}
                    type="button"
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-caption-12-medium transition-colors",
                      active
                        ? "border-border-focus bg-brand-subtle text-text-link"
                        : "border-border-soft bg-card text-text-secondary hover:bg-surface-subtle",
                    )}
                    onClick={() => {
                      setAgeFilter(filter)
                      setCurrentPageIndex(0)
                      setSelectedPointId(null)
                    }}
                  >
                    {filter === "all" ? "전체" : filter}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {!selectedPage ? (
          <EmptyState
            title="히트맵 데이터가 없습니다"
            description="선택한 페이지에 연결된 히트맵 데이터가 아직 없습니다."
          />
        ) : (
          <>
            <HeatmapCanvas
              page={selectedPage}
              selectedPointId={selectedPoint?.issueId ?? null}
              onSelectPoint={setSelectedPointId}
              hoveredPointId={hoveredPointId}
              onHoverPoint={setHoveredPointId}
            />

            <PointDetail point={selectedPoint} />

            <Card
              className={cn(
                "rounded-2xl border border-border-strong bg-card shadow-none",
                motion.card,
              )}
              style={{ display: "none" }}
            >
              <CardContent className="grid gap-4 px-6 py-5">
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-text-muted" />
                  <p className="text-body-14-medium text-text-body">오류 포인트 목록</p>
                </div>

                {selectedPage.points.length > 0 ? (
                  <div className="grid gap-3">
                    {selectedPage.points.map((point, index) => {
                      const uniqueKey = `${selectedPage.pageUrl}-${point.issueId}-${index}`

                      return (
                        <button
                          key={uniqueKey}
                          type="button"
                          onClick={() => setSelectedPointId(point.issueId)}
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-left transition-colors",
                            selectedPoint?.issueId === point.issueId
                              ? "border-border-focus bg-card"
                              : "border-border-soft bg-surface-subtle hover:bg-card",
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <IssueBadge variant={getPointBadgeVariant(point)} size="sm">
                                {point.errorType}
                              </IssueBadge>
                              <p className="text-body-14-medium text-text-body">
                                {point.issueId}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-caption-12-medium text-text-secondary">
                              <span>
                                연령대 {point.ageBand === "all" ? "전체" : point.ageBand}
                              </span>
                              <span>쨌</span>
                              <span>영향 {point.affectedUsersCount}명</span>
                              <span>쨌</span>
                              <span>차단율 {formatPercent(point.blockRate)}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-caption-12-regular text-text-muted">
                            {point.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="표시할 오류 포인트가 없습니다"
                    description="현재 필터 조건에 맞는 히트맵 포인트가 없습니다."
                  />
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-border-soft bg-card px-3 py-2 text-caption-12-medium text-text-secondary disabled:opacity-50"
                    onClick={() => {
                      setCurrentPageIndex((prev) => Math.max(0, prev - 1))
                      setSelectedPointId(null)
                    }}
                    disabled={currentPageIndex <= 0}
                  >
                    이전 페이지
                  </button>
                  <div className="rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary">
                    페이지 {selectedPage.pagination.currentPage + 1}
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-border-soft bg-card px-3 py-2 text-caption-12-medium text-text-secondary disabled:opacity-50"
                    onClick={() => {
                      setCurrentPageIndex((prev) => prev + 1)
                      setSelectedPointId(null)
                    }}
                    disabled={!selectedPage.pagination.hasMore}
                  >
                    다음 페이지
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default ResultHeatmapPage
