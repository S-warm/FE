import { useMemo, useState } from "react"
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
}: {
  page: ResultHeatmapPageViewModel
  selectedPointId: string | null
  onSelectPoint: (issueId: string) => void
}) {
  const [failedScreenshotUrl, setFailedScreenshotUrl] = useState<string | null>(null)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-card">
      {page.screenshotUrl && failedScreenshotUrl !== page.screenshotUrl ? (
        <img
          src={page.screenshotUrl}
          alt={page.pageName}
          className="aspect-[16/10] w-full object-cover"
          onError={() => setFailedScreenshotUrl(page.screenshotUrl ?? null)}
        />
      ) : (
        <div className="grid aspect-[16/10] place-items-center bg-surface-subtle">
          <p className="text-caption-12-regular text-text-muted">
            스크린샷이 없습니다
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        {page.points.map((point, index) => {
          const isSelected = point.issueId === selectedPointId
          // 고유한 key: page URL + issueId + index (페이지별 중복 방지)
          const uniqueKey = `${page.pageUrl}-${point.issueId}-${index}`
          return (
            <button
              key={uniqueKey}
              type="button"
              onClick={() => onSelectPoint(point.issueId)}
              className={cn(
                "pointer-events-auto absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[11px] font-semibold text-white shadow-lg transition-transform hover:scale-105",
                getMarkerColor(point),
                isSelected ? "ring-4 ring-white/70" : "",
              )}
              style={{
                left: `${point.x * 100}%`,
                top: `${point.y * 100}%`,
              }}
              aria-label={`${point.issueId} ${point.description}`}
            >
              {point.count}
            </button>
          )
        })}
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
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <IssueBadge variant={getPointBadgeVariant(point)} size="sm">
                {point.errorType}
              </IssueBadge>
              <p className="text-body-14-medium text-text-body">{point.issueId}</p>
            </div>
            <p className="text-caption-12-regular text-text-muted">
              {point.description}
            </p>
          </div>
          <div className="rounded-xl bg-surface-subtle px-3 py-2 text-caption-12-medium text-text-secondary">
            영향 사용자 {point.affectedUsersCount}명
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
    () =>
      selectedPage?.points.find((point) => point.issueId === selectedPointId) ??
      selectedPage?.points[0] ??
      null,
    [selectedPage, selectedPointId],
  )

  const sidePages = useMemo(
    () =>
      pages.map((page) => ({
        id: page.pageId,
        name: page.pageName,
        screenshotUrl: page.screenshotUrl || "/mock-images/img-example-site.png",
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
            />

            <PointDetail point={selectedPoint} />

            <Card
              className={cn(
                "rounded-2xl border border-border-strong bg-card shadow-none",
                motion.card,
              )}
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
                          <p className="text-caption-12-medium text-text-secondary">
                            영향 {point.affectedUsersCount}명 · 차단율{" "}
                            {formatPercent(point.blockRate)}
                          </p>
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
