import { useMemo, useRef, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Info } from "lucide-react"

import { IssueBadge } from "@/components/atoms"
import { EmptyState } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
import { useResultHeatmapQuery } from "@/queries"
import type { ResultAgeFilter } from "@/types/view-model/common/result-meta"
import type {
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
  if (point.severity.rank >= 4) return "bg-danger-text"
  if (point.severity.rank >= 2) return "bg-warning-text"
  return "bg-brand-accent"
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
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
  const [failedScreenshotUrl, setFailedScreenshotUrl] = useState<string | null>(null)
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null)
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null) // 오버레이용

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImgDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  }

  // 컨테이너 위치 추적
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect())
      }
    }

    updateRect()

    // 스크롤, 리사이즈 이벤트 리스너
    window.addEventListener('scroll', updateRect)
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('scroll', updateRect)
      window.removeEventListener('resize', updateRect)
    }
  }, [page.pageId]) // 페이지 변경 감지

  // 이미지가 object-contain으로 표시될 때 실제 위치 계산
  const getPointPosition = (pointX: number, pointY: number) => {
    if (!imgDimensions) return { left: `${pointX}%`, top: `${pointY}%` }

    // 실제 이미지 크기를 기반으로 포인트 위치 계산 (container max-height 없음)

    // 이미지가 원본 비율대로 표시되므로 단순 백분율 계산
    return {
      left: `${pointX}%`,
      top: `${pointY}%`,
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-border-strong bg-card overflow-y-auto"
      style={{ maxHeight: '80vh' }}
    >
      {page.screenshotUrl && failedScreenshotUrl !== page.screenshotUrl ? (
        <img
          src={page.screenshotUrl}
          alt={page.pageName}
          className="w-full object-contain"
          style={{ display: 'block' }}
          onLoad={handleImageLoad}
          onError={() => setFailedScreenshotUrl(page.screenshotUrl ?? null)}
        />
      ) : (
        <div className="grid w-full place-items-center py-12">
          <p className="text-caption-12-regular text-text-muted">
            스크린샷이 없습니다
          </p>
        </div>
      )}

      {/* 스포트라이트 어두운 오버레이 - fixed로 전환 + 부드러운 fade-in/out */}
      {containerRect && (
        <div
          className="pointer-events-none fixed bg-black/60 transition-opacity duration-300 ease-in-out"
          style={{
            left: `${containerRect.left}px`,
            top: `${containerRect.top}px`,
            width: `${containerRect.width}px`,
            height: `${containerRect.height}px`,
            borderRadius: '1rem',
            zIndex: 50,
            maxHeight: `${containerRect.height}px`,
            overflow: 'hidden',
            opacity: hoveredPointId ? 1 : 0,
            pointerEvents: hoveredPointId ? 'none' : 'none',
          }}
        />
      )}

      {/* 마커들 - absolute로 캔버스 내부에 고정 */}
      <div className="pointer-events-none absolute inset-0">
        {page.points.map((point, index) => {
          const isSelected = point.issueId === selectedPointId
          const isHovered = point.issueId === hoveredPointId
          // 고유한 key: page URL + issueId + index (페이지별 중복 방지)
          const uniqueKey = `${page.pageUrl}-${point.issueId}-${index}`
          const position = getPointPosition(point.x, point.y)

          // tooltip 위치 계산 (픽셀 좌표)
          const tooltipX = containerRect
            ? containerRect.left + (containerRect.width * parseFloat(position.left as string)) / 100
            : 0
          const tooltipY = containerRect
            ? containerRect.top + (containerRect.height * parseFloat(position.top as string)) / 100
            : 0

          return (
            <div key={uniqueKey}>
              <button
                type="button"
                onClick={() => onSelectPoint(point.issueId)}
                onMouseEnter={() => onHoverPoint(point.issueId)}
                onMouseLeave={() => onHoverPoint(null)}
                className={cn(
                  "pointer-events-auto absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[12px] font-semibold text-white shadow-lg transition-all duration-300",
                  getMarkerColor(point),
                  isSelected ? "ring-4 ring-white/70" : "",
                  isHovered ? "ring-4 ring-white/100 shadow-2xl brightness-150" : "hover:scale-105",
                  hoveredPointId && !isHovered ? "opacity-30 brightness-75" : "opacity-100",
                )}
                style={{
                  left: position.left,
                  top: position.top,
                  zIndex: isHovered ? 10 : 1,
                }}
                aria-label={`${point.issueId} ${point.description}`}
              >
                {point.count}
              </button>

              {/* 호버 시 tooltip 표시 */}
              {isHovered && (
                <MarkerTooltip
                  point={point}
                  position={{ x: tooltipX, y: tooltipY }}
                />
              )}
            </div>
          )
        })}
      </div>
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

  // 기본 위치: 마커 우측 12px, 위쪽 50px
  let left = position.x + 12
  let top = position.y - 50

  // Tooltip 크기 (대략적인 예상값)
  const tooltipWidth = tooltipRect?.width ?? 280
  const tooltipHeight = tooltipRect?.height ?? 100
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = 16

  // 우측 범위 초과 확인 (우측 끝)
  if (left + tooltipWidth > viewportWidth - padding) {
    left = position.x - tooltipWidth - 12 // 마커 좌측으로 변경
  }

  // 상단 범위 초과 확인 (상단 끝)
  if (top < padding) {
    top = position.y + 12 // 마커 하단으로 변경
  }

  // 하단 범위 초과 확인 (하단 끝)
  if (top + tooltipHeight > viewportHeight - padding) {
    top = position.y - tooltipHeight - 12 // 마커 상단으로 조정
  }

  // 좌측 범위 초과 확인 (좌측 끝)
  if (left < padding) {
    left = position.x + 12 // 마커 우측으로 되돌림
  }

  return (
    <div
      ref={tooltipRef}
      className="pointer-events-none fixed bg-white border border-border-strong rounded-xl shadow-lg p-3 z-70 max-w-xs"
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
        <p className="text-caption-12-regular text-text-muted">
          {point.description}
        </p>
      </div>
    </div>
  )
}

function PointDetail({
  point,
}: {
  point: ResultHeatmapPointViewModel | null
}) {
  if (!point) {
    return (
      <EmptyState
        title="선택된 오류 포인트가 없습니다"
        description="스크린샷의 마커 또는 아래 목록에서 오류 포인트를 선택해주세요."
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
            <p className="text-caption-12-regular text-text-muted mt-1">
              선택한 히트맵 포인트의 오류 상황을 분석한 결과입니다. 차단율, 반복 발생 횟수, 오류 타입 분포를 통해 문제의 심각도를 파악할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IssueBadge variant={getPointBadgeVariant(point)} size="sm">
                {point.errorType}
              </IssueBadge>
              <p className="text-body-14-medium text-text-body">{point.issueId}</p>
            </div>
            <p className="text-caption-12-regular text-text-muted mb-2">
              {point.description}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-caption-12-medium text-text-secondary">
                위배 연령대 {point.ageBand === "all" ? "전체" : point.ageBand}
              </p>
              <div className="rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary whitespace-nowrap">
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
            <p className="mt-1 text-body-14-medium text-text-body">
              {point.count}건
            </p>
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
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useResultHeatmapQuery({
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
  )

  const selectedPage = useMemo<ResultHeatmapPageViewModel | null>(
    () => pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId],
  )
  const selectedPoint = useMemo(
    () => {
      // 호버된 포인트가 있으면 호버된 포인트 표시, 없으면 선택된 포인트 표시
      if (hoveredPointId) {
        return selectedPage?.points.find((point) => point.issueId === hoveredPointId) ?? null
      }
      return (
        selectedPage?.points.find((point) => point.issueId === selectedPointId) ??
        selectedPage?.points[0] ??
        null
      )
    },
    [selectedPage, selectedPointId, hoveredPointId],
  )

  const sidePages = useMemo(
    () =>
      pages.map((page) => ({
        id: page.pageId,
        name: page.pageName,
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
        description="잠시 후 다시 시도해주세요."
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
                  연령대와 페이지네이션 기준으로 집계된 오류 포인트를 확인합니다.
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
              style={{ display: 'none' }}
            >
              <CardContent className="grid gap-4 px-6 py-5">
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-text-muted" />
                  <p className="text-body-14-medium text-text-body">오류 포인트 목록</p>
                </div>

                {selectedPage.points.length > 0 ? (
                  <div className="grid gap-3">
                    {selectedPage.points.map((point, index) => {
                      // 고유한 key: page URL + issueId + index (페이지별 중복 방지)
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
                            <IssueBadge
                              variant={getPointBadgeVariant(point)}
                              size="sm"
                            >
                              {point.errorType}
                            </IssueBadge>
                            <p className="text-body-14-medium text-text-body">
                              {point.issueId}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 text-caption-12-medium text-text-secondary">
                            <span>연령대 {point.ageBand === "all" ? "전체" : point.ageBand}</span>
                            <span>·</span>
                            <span>영향 {point.affectedUsersCount}명</span>
                            <span>·</span>
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

export default ResultHeatmapPa