import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { ArrowRight, X } from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { DonutChart } from "@/components/charts"
import { EmptyState, IssueListSection } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
import { motion } from "@/lib/motion"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { cn } from "@/lib/utils"
import { useResultIssuesQuery } from "@/queries"
import type { ResultIssueViewModel, ResultIssuesPageViewModel } from "@/types/view-model/result/result-issues"

const filterCategories = ["접근성", "사용성", "시각요소", "기타"] as const
type IssueCategoryFilter = (typeof filterCategories)[number]

const categoryColorMap: Record<IssueCategoryFilter, string> = {
  접근성: "var(--color-category-accessibility)",
  사용성: "var(--color-category-usability)",
  시각요소: "var(--color-category-visual)",
  기타: "var(--color-category-etc)",
}

function buildCategoryDonut(issues: ResultIssueViewModel[]) {
  const total = issues.length || 1
  const counts = filterCategories.reduce<Record<IssueCategoryFilter, number>>(
    (acc, category) => {
      acc[category] = 0
      return acc
    },
    {} as Record<IssueCategoryFilter, number>,
  )

  for (const issue of issues) {
    const category = issue.category as IssueCategoryFilter
    if (category in counts) {
      counts[category] += 1
    }
  }

  return filterCategories.map((category) => {
    const count = counts[category]
    const percent = Math.round((count / total) * 100)

    return {
      name: category,
      count,
      percent,
      color: categoryColorMap[category],
      value: Math.max(0, percent),
    }
  })
}

const severityToneColorMap: Record<string, string> = {
  error: "#ef4444",
  warning: "#f59e0b",
  neutral: "#94a3b8",
  info: "#94a3b8",
}

function CategoryPopup({
  category,
  issues,
  color,
  onClose,
}: {
  category: string
  issues: ResultIssueViewModel[]
  color: string
  onClose: () => void
}) {
  const severityBar = useMemo(() => {
    if (!issues.length) return []
    const groups: Record<string, { label: string; tone: string; count: number }> = {}
    let total = 0
    for (const issue of issues) {
      const { label, tone } = issue.severity
      if (!groups[label]) groups[label] = { label, tone, count: 0 }
      groups[label].count += issue.totalFailures
      total += issue.totalFailures
    }
    if (total === 0) return []
    return Object.values(groups)
      .sort((a, b) => b.count - a.count)
      .map((g) => ({
        name: g.label,
        value: Math.round((g.count / total) * 100),
        count: g.count,
        color: severityToneColorMap[g.tone] ?? "#94a3b8",
      }))
  }, [issues])

  const [barAnimated, setBarAnimated] = useState(false)
  useEffect(() => {
    setBarAnimated(false)
    let id2: number
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setBarAnimated(true))
    })
    return () => {
      cancelAnimationFrame(id1)
      cancelAnimationFrame(id2)
    }
  }, [category])

  return (
    <div className="animate-in fade-in-0 slide-in-from-right-3 absolute right-0 top-1/2 z-10 w-[300px] -translate-y-1/2 rounded-2xl border border-border-strong bg-card p-4 shadow-lg duration-200 ease-out">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-sm" style={{ backgroundColor: color }} />
          <p className="text-subtitle-16-semibold text-text-body">{category}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-6 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text-body"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mb-3">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-border-strong bg-surface-subtle">
            {severityBar.length === 0 ? (
              <div className="h-full w-1 bg-border-strong" />
            ) : (
              severityBar.map((item) => (
                <div
                  key={item.name}
                  style={{
                    width: barAnimated ? `${item.value}%` : "0%",
                    backgroundColor: item.color,
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              ))
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {severityBar.map((item) => (
              <span key={item.name} className="flex items-center gap-1 text-[12px] text-text-muted">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value}%)
              </span>
            ))}
          </div>
        </div>

      <div className="grid gap-1.5">
        {issues.length === 0 ? (
          <p className="text-caption-12-regular text-text-muted">이슈가 없습니다.</p>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.issueId}
              className="flex items-center gap-2 rounded-lg bg-surface-subtle px-2.5 py-2"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: severityToneColorMap[issue.severity.tone] ?? "#94a3b8" }}
              />
              <p className="min-w-0 flex-1 truncate text-[12px] text-text-body">{issue.title}</p>
              <span className="shrink-0 text-[11px] text-text-muted">{issue.totalFailures}건</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ResultIssuesPage() {
  const { simulationId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const resolvedId = simulationId ?? "unknown"
  const search = location.search
  const { data, isLoading, isError, refetch } = useResultIssuesQuery(resolvedId)

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
  const [activeFilters, setActiveFilters] = useState<IssueCategoryFilter[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const issuesSectionRef = useRef<HTMLDivElement>(null)


  const selectedPage: ResultIssuesPageViewModel | null =
    pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null

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

  const filteredIssues = useMemo(() => {
    if (!selectedPage) return []
    if (!activeFilters.length) return selectedPage.issues
    return selectedPage.issues.filter((issue) =>
      activeFilters.includes(issue.category as IssueCategoryFilter),
    )
  }, [activeFilters, selectedPage])

  const allDonut = useMemo(
    () => buildCategoryDonut(selectedPage?.issues ?? []),
    [selectedPage],
  )

  const categoryIssues = useMemo(() => {
    if (!activeCategory || !selectedPage) return []
    return selectedPage.issues.filter((issue) => issue.category === activeCategory)
  }, [activeCategory, selectedPage])

  const handleSegmentClick = (name: string | null) => {
    setActiveCategory(name)
  }

  const donut = useMemo(
    () =>
      activeFilters.length === 0
        ? [...allDonut]
        : allDonut.filter((item) => activeFilters.includes(item.name as IssueCategoryFilter)),
    [allDonut, activeFilters],
  )

  if (isLoading) {
    return <ResultPageSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="이슈 데이터를 불러오지 못했습니다"
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
        title="이슈 데이터가 없습니다"
        description="선택한 시뮬레이션에 연결된 주요 이슈 데이터가 아직 없습니다."
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
          expandPage(pageId)
        }}
        onTogglePage={togglePage}
      />

      <div className="grid gap-4">
        {!selectedPage ? (
          <EmptyState
            title="이슈 데이터가 없습니다"
            description="선택한 페이지에 연결된 주요 이슈 데이터가 아직 없습니다."
          />
        ) : null}

        <Card
          className={cn(
            "rounded-2xl border border-border-strong bg-card shadow-none",
            motion.card,
          )}
        >
          <CardContent className="relative grid gap-3 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-medium text-text-body">카테고리별 분류</p>
              <CommonButton
                size="sm"
                variant="secondary"
                className="rounded-xl border border-border-soft-2 bg-surface-muted text-text-secondary hover:bg-surface-muted-hover"
                onClick={() => navigate(`/result/${resolvedId}/heatmap${search}`)}
              >
                히트맵으로 보기
                <ArrowRight className="size-4" />
              </CommonButton>
            </div>

            <div className="relative">
              <DonutChart
                heightClassName="h-[220px]"
                outerLabels
                data={donut.map((item) => ({
                  name: item.name,
                  value: item.value,
                  count: item.count,
                  color: item.color,
                }))}
                emptyDescription="이슈가 연결되면 카테고리 분포가 여기에 표시됩니다."
                activeSegmentName={activeCategory}
                onSegmentClick={handleSegmentClick}
              />
              {activeCategory ? (
                <CategoryPopup
                  category={activeCategory}
                  issues={categoryIssues}
                  color={categoryColorMap[activeCategory as IssueCategoryFilter] ?? "#ccc"}
                  onClose={() => setActiveCategory(null)}
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => {
                const selected = activeFilters.length === 0 || activeFilters.includes(category)
                const color = categoryColorMap[category]
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveFilters((prev) =>
                        prev.includes(category)
                          ? prev.filter((item) => item !== category)
                          : [...prev, category],
                      )
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-opacity",
                      selected
                        ? "border-border-strong bg-card text-text-body"
                        : "border-border-soft bg-surface-muted text-text-muted opacity-50",
                    )}
                  >
                    <span className="size-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                    {category}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <section ref={issuesSectionRef}>
          {selectedPage && filteredIssues.length > 0 ? (
            <IssueListSection
              issues={filteredIssues}
              title="이슈 목록"
              pageUrl={selectedPage.pageUrl}
              headerAction={
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="rounded-xl border border-border-soft-2 bg-surface-muted text-text-secondary hover:bg-surface-muted-hover"
                  onClick={() => {
                    setActiveFilters([])
                    issuesSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }}
                >
                  이슈 전체 보기
                </CommonButton>
              }
            />
          ) : (
            <EmptyState
              title="표시할 이슈가 없습니다"
              description="현재 필터 조건에 맞는 이슈가 없거나 아직 분석 데이터가 연결되지 않았습니다."
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default ResultIssuesPage
