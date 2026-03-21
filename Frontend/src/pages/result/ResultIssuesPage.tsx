import { useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AlertTriangle, ArrowRight, ChevronDown, Sparkles } from "lucide-react"

import { CommonButton, IssueBadge } from "@/components/atoms"
import { DonutChart } from "@/components/charts"
import { ChipTag } from "@/components/forms"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { IssueCategory, ResultIssue, ResultIssuePage } from "@/mocks/result-issues.mock"
import { resultIssuePages } from "@/mocks/result-issues.mock"

const filterCategories: IssueCategory[] = ["접근성", "사용성", "시각요소", "기타"]

const categoryColorMap: Record<IssueCategory, string> = {
  접근성: "#B79CFF",
  시각요소: "#8BC5FF",
  사용성: "#79E2E6",
  기타: "#B7C2D9",
}

function PagePreview({ label }: { label: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border-strong bg-gradient-to-br from-brand-subtle via-card to-surface-subtle">
      <div className="aspect-[16/10] w-full" />
      <div className="absolute inset-0 grid place-items-center">
        <p className="rounded-full bg-card/85 px-3 py-1 text-caption-12-medium text-text-secondary shadow-sm">{label}</p>
      </div>
    </div>
  )
}

function IssueCard({ issue }: { issue: ResultIssue }) {
  const { simulationId } = useParams()
  const navigate = useNavigate()
  const resolvedId = simulationId ?? "unknown"

  return (
    <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
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
                  {issue.category}
                </IssueBadge>
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2 text-[11px] font-medium text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-caption-12-regular text-text-subtle">
                {issue.affectedUsers.count}명 사용자 영향 ({issue.affectedUsers.percent}%)
              </p>
            </div>
          </div>

          <p className="text-caption-12-regular text-text-muted">{issue.description}</p>

          <div className="grid gap-1">
            <p className="text-caption-12-medium text-text-subtle">영향받는 요소</p>
            <code className="w-fit rounded-xl bg-surface-muted px-3 py-2 text-[12px] text-text-body">
              {issue.selector}
            </code>
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-end gap-2 md:flex-col md:items-end md:justify-start">
          <span className="inline-flex h-6 items-center rounded-full bg-brand-accent px-3 text-caption-12-medium text-white">
            {issue.expectedBenefit.label} {issue.expectedBenefit.delta}
          </span>
          <div className="flex items-center gap-2">
            <CommonButton
              size="sm"
              variant="secondary"
              className="rounded-xl border border-border-soft-2 bg-brand-subtle text-text-link hover:bg-brand-subtle-hover"
              onClick={() => navigate(`/result/${resolvedId}/ai`)}
            >
              <Sparkles className="size-4" />
              AI 수정 받기
            </CommonButton>
            <CommonButton
              size="sm"
              variant="secondary"
              className="rounded-xl border border-border-soft-2 bg-surface-muted text-text-secondary hover:bg-surface-muted-hover"
              onClick={() => navigate(`/result/${resolvedId}/heatmap`)}
            >
              히트맵에서 보기
              <ArrowRight className="size-4" />
            </CommonButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function buildCategoryDonut(issues: ResultIssue[]) {
  const total = issues.length || 1
  const counts = filterCategories.reduce<Record<IssueCategory, number>>(
    (acc, category) => {
      acc[category] = 0
      return acc
    },
    {} as Record<IssueCategory, number>
  )

  for (const issue of issues) {
    counts[issue.category] = (counts[issue.category] ?? 0) + 1
  }

  return filterCategories.map((category) => {
    const count = counts[category] ?? 0
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
  const [selectedPageId, setSelectedPageId] = useState<string>(resultIssuePages[0]?.id ?? "login")
  const [expandedPageId, setExpandedPageId] = useState<string>(resultIssuePages[0]?.id ?? "login")
  const [activeFilters, setActiveFilters] = useState<IssueCategory[]>(["접근성", "사용성", "시각요소"])
  const issuesSectionRef = useRef<HTMLDivElement>(null)

  const selectedPage: ResultIssuePage =
    resultIssuePages.find((page) => page.id === selectedPageId) ?? resultIssuePages[0]

  const filteredIssues = useMemo(() => {
    if (!activeFilters.length) return selectedPage.issues
    return selectedPage.issues.filter((issue) => activeFilters.includes(issue.category))
  }, [activeFilters, selectedPage])

  const donut = useMemo(() => buildCategoryDonut(filteredIssues), [filteredIssues])

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit rounded-2xl border border-border-strong bg-card shadow-none">
        <CardContent className="grid gap-5 px-4 py-5">
          <div className="grid gap-3">
            <p className="text-caption-12-medium text-text-muted">필터링</p>
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => {
                const selected = activeFilters.includes(category)
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

          <div className="grid gap-3">
            <p className="text-caption-12-medium text-text-muted">페이지</p>
            <div className="grid gap-2">
              {resultIssuePages.map((page) => {
                const expanded = expandedPageId === page.id
                const isSelected = selectedPageId === page.id
                return (
                  <div key={page.id} className="rounded-2xl border border-border-soft bg-surface-subtle">
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-body-14-medium transition-colors",
                        isSelected ? "text-text-strong" : "text-text-muted hover:text-text-secondary"
                      )}
                      onClick={() => {
                        setSelectedPageId(page.id)
                        setExpandedPageId(page.id)
                      }}
                    >
                      <span className="truncate">{page.name}</span>
                      <ChevronDown className={cn("size-4 transition-transform", expanded ? "rotate-180" : "")} />
                    </button>

                    {expanded ? (
                      <div className="grid gap-2 px-3 pb-3">
                        <PagePreview label={page.name} />
                        <div className="flex flex-wrap gap-1.5">
                          {page.highlights.map((highlight) => (
                            <span
                              key={highlight}
                              className="inline-flex h-6 items-center rounded-full border border-border-soft-2 bg-card px-2 text-caption-12-medium text-text-muted"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="grid gap-5 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-caption-12-regular text-text-subtle">페이지</p>
                <Select
                  value={selectedPageId}
                  onValueChange={(value) => {
                    if (!value) return
                    setSelectedPageId(value)
                    setExpandedPageId(value)
                  }}
                >
                  <SelectTrigger className="rounded-xl border-border-soft-2 bg-surface-subtle px-3 py-2 text-sm">
                    <SelectValue placeholder="페이지 선택" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {resultIssuePages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end">
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="rounded-xl border border-border-soft-2 bg-surface-muted text-text-secondary hover:bg-surface-muted-hover"
                  onClick={() => {
                    setActiveFilters(filterCategories)
                    issuesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                >
                  이슈 전체보기
                </CommonButton>
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-body-14-medium text-text-body">카테고리별 분류</p>
              <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] md:items-center">
                <DonutChart
                  heightClassName="h-[200px]"
                  data={donut.map((item) => ({
                    name: item.name,
                    value: item.value,
                    color: item.color,
                  }))}
                />
                <div className="grid gap-2">
                  {donut.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <p className="text-caption-12-regular text-text-muted">{item.name}</p>
                      </div>
                      <p className="text-caption-12-medium text-text-muted">
                        {item.count}건 / {item.percent}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section ref={issuesSectionRef} className="grid gap-3">
          <p className="text-body-14-medium text-text-body">이슈목록</p>
          <div className="grid gap-3">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ResultIssuesPage
