import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react"

import { CommonButton, IssueBadge } from "@/components/atoms"
import { DonutChart } from "@/components/charts"
import { ChipTag } from "@/components/forms"
import { EmptyState } from "@/components/sections/empty-state"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { getCategoryColor } from "@/features/result/issues/model/category-style"
import { adaptIssuesResponse, type IssuesViewModelIssue, type IssuesViewModelPage } from "@/features/result/issues/model/issues-adapter"
import { fetchSimulationIssues } from "@/features/result/shared/result-api"
import { useResultPageState } from "@/features/result/shared/use-result-page-state"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"

function IssueCard({ issue }: { issue: IssuesViewModelIssue }) {
  const { simulationId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const resolvedId = simulationId ?? "unknown"
  const search = location.search

  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="grid gap-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl bg-danger-surface text-danger-text">
              <AlertTriangle className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-body-14-medium text-text-body">{issue.title}</p>
                <IssueBadge variant={issue.severity} size="sm">
                  {issue.severityLabel}
                </IssueBadge>
                <span className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2 text-[11px] font-medium text-text-secondary">
                  {issue.category}
                </span>
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2 text-[11px] font-medium text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-caption-12-regular text-text-subtle">
                {issue.affectedUsersCount} impacted users ({issue.affectedUsersPercent}%)
              </p>
            </div>
          </div>

          <p className="text-caption-12-regular text-text-muted">{issue.description}</p>

          <div className="grid gap-1">
            <p className="text-caption-12-medium text-text-subtle">Affected element</p>
            <code className="w-fit rounded-xl bg-surface-muted px-3 py-2 text-[12px] text-text-body">
              {issue.targetHtml}
            </code>
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-end gap-2 md:flex-col md:items-end md:justify-start">
          <div className="flex items-center gap-2">
            <CommonButton
              size="sm"
              variant="secondary"
              className="rounded-xl border border-border-soft-2 bg-brand-subtle text-text-link hover:bg-brand-subtle-hover"
              onClick={() => navigate(`/result/${resolvedId}/ai${search}`)}
            >
              <Sparkles className="size-4" />
              AI fix
            </CommonButton>
            <CommonButton
              size="sm"
              variant="secondary"
              className="rounded-xl border border-border-soft-2 bg-surface-muted text-text-secondary hover:bg-surface-muted-hover"
              onClick={() => navigate(`/result/${resolvedId}/heatmap${search}`)}
            >
              View heatmap
              <ArrowRight className="size-4" />
            </CommonButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function IssuesLoadedView({
  pages,
  categories,
}: {
  pages: IssuesViewModelPage[]
  categories: string[]
}) {
  const { selectedPageId, setSelectedPageId, expandedPageId, setExpandedPageId } = useResultPageState()
  const [activeFilters, setActiveFilters] = useState<string[]>(() => categories)
  const issuesSectionRef = useRef<HTMLDivElement>(null)

  const selectedPage = pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null
  const selectedFilters = activeFilters.length ? activeFilters : categories

  const filteredIssues = useMemo(() => {
    if (!selectedPage) return []
    if (!selectedFilters.length) return selectedPage.issues
    return selectedPage.issues.filter((issue) => selectedFilters.includes(issue.category))
  }, [selectedFilters, selectedPage])

  const donut = useMemo(() => {
    const total = filteredIssues.length || 1
    const counts = filteredIssues.reduce<Record<string, number>>((acc, issue) => {
      acc[issue.category] = (acc[issue.category] ?? 0) + 1
      return acc
    }, {})

    return categories.map((category) => {
      const count = counts[category] ?? 0
      const percent = Math.round((count / total) * 100)

      return {
        name: category,
        count,
        percent,
        color: getCategoryColor(category),
        value: Math.max(0, percent),
      }
    })
  }, [categories, filteredIssues])

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        title="페이지"
        pages={pages}
        selectedPageId={selectedPage?.id ?? ""}
        expandedPageId={expandedPageId}
        onSelectPage={setSelectedPageId}
        onExpandPage={setExpandedPageId}
      />

      <div className="grid gap-4">
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-caption-12-medium text-text-secondary">Filter</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const selected = selectedFilters.includes(category)
                      return (
                        <ChipTag
                          key={category}
                          selected={selected}
                          className="h-7 px-2.5 text-[12px]"
                          onClick={() => {
                            setActiveFilters((prev) =>
                              prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
                            )
                          }}
                        >
                          {category}
                        </ChipTag>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="rounded-xl border border-border-soft-2 bg-surface-muted text-text-secondary hover:bg-surface-muted-hover"
                  onClick={() => {
                    setActiveFilters(categories)
                    issuesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                >
                  View all issues
                </CommonButton>
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-body-14-medium text-text-body">Issue categories</p>
              <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] md:items-center">
                <DonutChart
                  heightClassName="h-[200px]"
                  data={donut.map((item) => ({
                    name: item.name,
                    value: item.value,
                    color: item.color,
                  }))}
                  emptyDescription="Issue category distribution appears after simulation data is available."
                />
                <div className="grid gap-2">
                  {donut.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                        <p className="text-caption-12-regular text-text-muted">{item.name}</p>
                      </div>
                      <p className="text-caption-12-medium text-text-secondary">
                        {item.count} / {item.percent}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section ref={issuesSectionRef} className="grid gap-3">
          <p className="text-body-14-medium text-text-body">Issue list</p>
          <div className="grid gap-3">
            {filteredIssues.length ? (
              filteredIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            ) : (
              <EmptyState title="No issues found" description="No issues matched the current page and filter selection." />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ResultIssuesContent({ simulationId }: { simulationId: string }) {
  const [issuesResponse, setIssuesResponse] = useState<ReturnType<typeof adaptIssuesResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const abortController = new AbortController()

    fetchSimulationIssues(simulationId, abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) return
        setIssuesResponse(adaptIssuesResponse(response))
      })
      .catch((fetchError) => {
        if (abortController.signal.aborted) return
        setIssuesResponse(null)
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load issues.")
      })
      .finally(() => {
        if (abortController.signal.aborted) return
        setIsLoading(false)
      })

    return () => {
      abortController.abort()
    }
  }, [simulationId])

  if (error) {
    return <EmptyState title="Issues unavailable" description={error} className="h-[320px]" />
  }

  if (isLoading || !issuesResponse) {
    return (
      <EmptyState
        title="Loading issues..."
        description="Fetching issue pages and issue details from the backend."
        className="h-[320px]"
      />
    )
  }

  if (!issuesResponse.pages.length) {
    return <EmptyState title="No issue pages" description="Issue pages will appear when issue data is available." className="h-[320px]" />
  }

  return <IssuesLoadedView key={simulationId} pages={issuesResponse.pages} categories={issuesResponse.categories} />
}

function ResultIssuesPage() {
  const { simulationId } = useParams()

  if (!simulationId) {
    return <EmptyState title="Issues unavailable" description="Missing simulation id." className="h-[320px]" />
  }

  return <ResultIssuesContent key={simulationId} simulationId={simulationId} />
}

export default ResultIssuesPage
