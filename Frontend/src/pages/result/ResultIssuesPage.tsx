import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { ArrowRight } from "lucide-react"

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
  )
  const [activeFilters, setActiveFilters] = useState<IssueCategoryFilter[]>([])
  const issuesSectionRef = useRef<HTMLDivElement>(null)

  const selectedPage: ResultIssuesPageViewModel | null =
    pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null

  const sidePages = useMemo(
    () =>
      pages.map((page) => ({
        id: page.pageId,
        name: page.pageName,
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

  const allDonut = useMemo(() => {
    // TODO: 실제 데이터 연결 후 buildCategoryDonut(selectedPage?.issues ?? []) 로 교체
    return [
      { name: "접근성", count: 2, percent: 20, color: categoryColorMap["접근성"], value: 20 },
      { name: "사용성", count: 2, percent: 20, color: categoryColorMap["사용성"], value: 20 },
      { name: "시각요소", count: 6, percent: 40, color: categoryColorMap["시각요소"], value: 40 },
      { name: "기타", count: 2, percent: 20, color: categoryColorMap["기타"], value: 20 },
    ] as const
  }, [])

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

            <div className="w-full">
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
              />
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
