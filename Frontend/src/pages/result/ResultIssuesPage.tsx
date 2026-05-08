import { useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { AlertTriangle, ArrowRight, ChevronRight, Sparkles, X } from "lucide-react"

import { CommonButton, IssueBadge } from "@/components/atoms"
import { DonutChart, HorizontalBarChart } from "@/components/charts"
import { ChipTag } from "@/components/forms"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type {
  IssueCategory,
  IssueFailureStageStat,
  IssuePersonaBreakdown,
  IssueSessionSample,
  ResultIssue,
  ResultIssueDetail,
  ResultIssuePage,
} from "@/mocks/result-issues.mock"
import { resultIssuePages } from "@/mocks/result-issues.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { motion } from "@/lib/motion"
import type { ProgressDatum } from "@/mocks/data-visualization.mock"

const filterCategories: IssueCategory[] = ["접근성", "사용성", "시각요소", "기타"]

const categoryColorMap: Record<IssueCategory, string> = {
  접근성: "var(--color-category-accessibility)",
  시각요소: "var(--color-category-visual)",
  사용성: "var(--color-category-usability)",
  기타: "var(--color-category-etc)",
}

const literacyLabelMap = {
  low: "낮음",
  medium: "보통",
  high: "높음",
} as const

const errorTypeLabelMap = {
  interaction: "상호작용",
  validation: "유효성",
  network: "네트워크",
  timeout: "타임아웃",
} as const

function buildIssueDetailFallback(issue: ResultIssue): ResultIssueDetail {
  const baseCount = issue.affectedUsers.count
  const ageGroups = ["20대", "30대", "40대", "50대"]
  const devicesByCategory: Record<IssueCategory, string[]> = {
    접근성: ["Windows", "Mac", "iPhone", "Android"],
    사용성: ["iPhone", "Android", "Windows", "Mac"],
    시각요소: ["iPhone", "Mac", "Windows", "Android"],
    기타: ["Windows", "Android", "Mac", "iPhone"],
  }
  const literacyByCategory: ResultIssueDetail["breakdown"][number]["digitalLiteracy"][] =
    issue.category === "접근성" ? ["low", "low", "medium", "medium"] : ["medium", "low", "medium", "high"]
  const weights = issue.severity === "error" ? [0.34, 0.28, 0.22, 0.16] : issue.severity === "warning" ? [0.3, 0.27, 0.23, 0.2] : [0.28, 0.26, 0.24, 0.22]
  const rawCounts = weights.map((weight) => Math.max(1, Math.round(baseCount * weight)))
  const diff = baseCount - rawCounts.reduce((sum, count) => sum + count, 0)
  rawCounts[0] += diff

  const breakdown: IssuePersonaBreakdown[] = ageGroups.map((ageGroup, index) => ({
    personaLabel: `${ageGroup} ${literacyLabelMap[literacyByCategory[index]]} 리터러시`,
    ageGroup,
    digitalLiteracy: literacyByCategory[index],
    device: devicesByCategory[issue.category][index],
    occurrences: rawCounts[index],
    failureRate: Math.min(96, Math.max(12, issue.affectedUsers.percent + 10 + index * 7)),
    lastFailedStep:
      [
        "입력값 검증 단계",
        "보조 안내 인식 단계",
        "주요 CTA 클릭 직전",
        "다음 화면 전환 직전",
      ][index] ?? "상호작용 단계",
  }))

  const stageCounts = [
    Math.max(1, Math.round(baseCount * 0.42)),
    Math.max(1, Math.round(baseCount * 0.33)),
    Math.max(1, baseCount - Math.round(baseCount * 0.42) - Math.round(baseCount * 0.33)),
  ]
  const topFailureStages: IssueFailureStageStat[] = [
    { label: "핵심 CTA 인지", count: stageCounts[0], percent: Math.round((stageCounts[0] / baseCount) * 100) },
    { label: "폼/필드 상호작용", count: stageCounts[1], percent: Math.round((stageCounts[1] / baseCount) * 100) },
    { label: "다음 단계 전환", count: stageCounts[2], percent: Math.round((stageCounts[2] / baseCount) * 100) },
  ]

  const errorTypes: IssueSessionSample["errorType"][] =
    issue.category === "기타"
      ? ["network", "timeout", "interaction"]
      : issue.category === "접근성"
        ? ["validation", "interaction", "timeout"]
        : ["interaction", "validation", "network"]

  const sessionSamples: IssueSessionSample[] = breakdown.slice(0, 3).map((item, index) => ({
    sessionId: `${issue.id}-sample-${index + 1}`,
    personaLabel: item.personaLabel,
    ageGroup: item.ageGroup,
    digitalLiteracy: item.digitalLiteracy,
    device: item.device,
    failureStep: topFailureStages[index]?.label ?? item.lastFailedStep,
    errorType: errorTypes[index] ?? "interaction",
    summary: `${item.device} 환경에서 ${issue.selector} 인근에서 멈췄고, ${item.lastFailedStep}에서 재시도가 반복되었습니다.`,
  }))

  return {
    breakdown,
    topFailureStages,
    sessionSamples,
  }
}

function buildBreakdownBars(breakdown: IssuePersonaBreakdown[]): ProgressDatum[] {
  const target = Math.max(...breakdown.map((item) => item.failureRate))

  return breakdown.map((item) => ({
    label: item.ageGroup,
    score: item.failureRate,
    color: item.failureRate === target ? "var(--color-chart-validation)" : "var(--color-primary-100)",
  }))
}

function IssueDetailSheet({
  issue,
  open,
  onOpenChange,
  onNavigateAiFix,
}: {
  issue: ResultIssue | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigateAiFix: () => void
}) {
  const detail = issue ? issue.detail ?? buildIssueDetailFallback(issue) : null
  const breakdownBars = useMemo(() => (detail ? buildBreakdownBars(detail.breakdown) : []), [detail])

  if (!issue || !detail || !open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/12 supports-backdrop-filter:backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
        aria-label="상세 분석 닫기"
      />
      <aside className="absolute inset-y-0 right-0 w-full max-w-[980px] overflow-hidden border-l border-border-strong bg-card shadow-2xl">
        <div className="grid h-full gap-0 overflow-hidden">
          <div className="grid gap-4 border-b border-border-soft bg-surface-subtle px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-danger-surface text-danger-text">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-subtitle-18-semibold text-text-body">{issue.title}</p>
                    <IssueBadge variant={issue.severity} size="sm">
                      {issue.category}
                    </IssueBadge>
                  </div>
                  <p className="text-caption-12-regular text-text-muted">{issue.description}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="rounded-xl border border-border-soft-2 bg-brand-subtle text-text-link hover:bg-brand-subtle-hover"
                  onClick={onNavigateAiFix}
                >
                  <Sparkles className="size-4" />
                  AI 수정 받기
                </CommonButton>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-xl border border-border-soft bg-card text-text-muted transition-colors hover:bg-surface-hover-2 hover:text-text-body"
                  onClick={() => onOpenChange(false)}
                  aria-label="상세 분석 닫기"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-2xl border border-border-soft bg-card px-4 py-3">
                <p className="text-caption-12-medium text-text-subtle">영향 사용자</p>
                <p className="mt-1 text-body-14-medium text-text-body">
                  {issue.affectedUsers.count}명 · {issue.affectedUsers.percent}%
                </p>
              </div>
              <div className="rounded-2xl border border-border-soft bg-card px-4 py-3">
                <p className="text-caption-12-medium text-text-subtle">영향 요소</p>
                <code className="mt-1 block truncate text-body-14-medium text-text-body">{issue.selector}</code>
              </div>
              <div className="rounded-2xl border border-border-soft bg-card px-4 py-3">
                <p className="text-caption-12-medium text-text-subtle">예상 개선 효과</p>
                <p className="mt-1 text-body-14-medium text-text-link">
                  {issue.expectedBenefit.label} {issue.expectedBenefit.delta}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
              <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
                <CardContent className="grid gap-4 px-5 py-5">
                  <div className="grid gap-1">
                    <p className="text-body-14-medium text-text-body">연령대별 실패 집중도</p>
                    <p className="text-caption-12-regular text-text-muted">
                      어떤 연령대/페르소나 그룹에서 이 이슈가 두드러졌는지 빠르게 봅니다.
                    </p>
                  </div>
                  <HorizontalBarChart
                    data={breakdownBars}
                    barColor="var(--color-chart-validation)"
                    mutedBarColor="var(--color-primary-100)"
                    highlightMode="max"
                    heightClassName="h-[220px]"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
                <CardContent className="grid gap-4 px-5 py-5">
                  <div className="grid gap-1">
                    <p className="text-body-14-medium text-text-body">대표 실패 구간</p>
                    <p className="text-caption-12-regular text-text-muted">
                      이슈가 주로 막히는 지점을 단계별 비중으로 정리했습니다.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {detail.topFailureStages.map((stage) => (
                      <div key={stage.label} className="grid gap-2 rounded-2xl border border-border-soft bg-surface-subtle px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-body-14-medium text-text-secondary">{stage.label}</p>
                          <p className="text-caption-12-medium text-text-body">
                            {stage.count}회 · {stage.percent}%
                          </p>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                          <div
                            className="h-full rounded-full bg-[var(--color-chart-validation)]"
                            style={{ width: `${stage.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
              <CardContent className="grid gap-4 px-5 py-5">
                <div className="grid gap-1">
                  <p className="text-body-14-medium text-text-body">어떤 페르소나에서 발생했는지</p>
                  <p className="text-caption-12-regular text-text-muted">
                    연령대, 리터러시, 디바이스 기준으로 영향이 큰 페르소나 그룹을 표로 정리했습니다.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left">
                        <th className="px-3 py-2 text-caption-12-medium text-text-subtle">페르소나 그룹</th>
                        <th className="px-3 py-2 text-caption-12-medium text-text-subtle">연령대</th>
                        <th className="px-3 py-2 text-caption-12-medium text-text-subtle">리터러시</th>
                        <th className="px-3 py-2 text-caption-12-medium text-text-subtle">디바이스</th>
                        <th className="px-3 py-2 text-caption-12-medium text-text-subtle">발생 횟수</th>
                        <th className="px-3 py-2 text-caption-12-medium text-text-subtle">실패율</th>
                        <th className="px-3 py-2 text-caption-12-medium text-text-subtle">마지막 실패 구간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.breakdown.map((row) => (
                        <tr key={row.personaLabel} className="rounded-2xl bg-surface-subtle">
                          <td className="rounded-l-2xl px-3 py-3 text-body-14-medium text-text-body">{row.personaLabel}</td>
                          <td className="px-3 py-3 text-body-14-medium text-text-secondary">{row.ageGroup}</td>
                          <td className="px-3 py-3 text-body-14-medium text-text-secondary">{literacyLabelMap[row.digitalLiteracy]}</td>
                          <td className="px-3 py-3 text-body-14-medium text-text-secondary">{row.device}</td>
                          <td className="px-3 py-3 text-body-14-medium text-text-secondary">{row.occurrences}회</td>
                          <td className="px-3 py-3 text-body-14-medium text-text-secondary">{row.failureRate}%</td>
                          <td className="rounded-r-2xl px-3 py-3 text-body-14-medium text-text-secondary">{row.lastFailedStep}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
              <CardContent className="grid gap-4 px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <p className="text-body-14-medium text-text-body">대표 실패 세션</p>
                    <p className="text-caption-12-regular text-text-muted">
                      원인 파악용으로 가장 자주 재현된 세션 샘플을 보여줍니다.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  {detail.sessionSamples.map((sample) => (
                    <div key={sample.sessionId} className="grid gap-3 rounded-2xl border border-border-soft bg-surface-subtle px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-card px-2.5 py-1 text-caption-12-medium text-text-secondary">
                          {sample.ageGroup}
                        </span>
                        <span className="rounded-full bg-card px-2.5 py-1 text-caption-12-medium text-text-secondary">
                          {sample.device}
                        </span>
                        <span className="rounded-full bg-card px-2.5 py-1 text-caption-12-medium text-text-secondary">
                          {errorTypeLabelMap[sample.errorType]}
                        </span>
                      </div>
                      <div className="grid gap-1">
                        <p className="text-body-14-medium text-text-body">{sample.personaLabel}</p>
                        <p className="text-caption-12-regular text-text-muted">{sample.summary}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-caption-12-medium text-text-subtle">{sample.failureStep}</p>
                        <span className="text-caption-12-medium text-text-link">{sample.sessionId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>
    </div>
  )
}

function IssueCard({ issue, onOpenDetail }: { issue: ResultIssue; onOpenDetail: (issue: ResultIssue) => void }) {
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
                  {issue.category}
                </IssueBadge>
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
          <CommonButton
            size="sm"
            variant="secondary"
            className="rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-hover-2"
            onClick={() => onOpenDetail(issue)}
          >
            상세 분석
            <ChevronRight className="size-4" />
          </CommonButton>
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
  const { simulationId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(selectedPageId)
  const [activeFilters, setActiveFilters] = useState<IssueCategory[]>(["접근성", "사용성", "시각요소"])
  const [selectedIssue, setSelectedIssue] = useState<ResultIssue | null>(null)
  const issuesSectionRef = useRef<HTMLDivElement>(null)
  const resolvedId = simulationId ?? "unknown"
  const search = location.search

  const selectedPage: ResultIssuePage =
    resultIssuePages.find((page) => page.id === selectedPageId) ?? resultIssuePages[0]

  const sidePages = useMemo(
    () =>
      resultPagesMock.map((page) => {
        const issueCount = resultIssuePages.find((item) => item.id === page.id)?.issues.length ?? 0
        return {
          id: page.id,
          name: page.name,
          screenshotUrl: page.screenshotUrl,
          metaText: `${issueCount}건 이슈`,
        }
      }),
    []
  )

  const filteredIssues = useMemo(() => {
    if (!activeFilters.length) return selectedPage.issues
    return selectedPage.issues.filter((issue) => activeFilters.includes(issue.category))
  }, [activeFilters, selectedPage])

  const donut = useMemo(() => buildCategoryDonut(filteredIssues), [filteredIssues])

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
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-caption-12-medium text-text-secondary">필터링</p>
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
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="rounded-xl border border-border-soft-2 bg-surface-muted text-text-secondary hover:bg-surface-muted-hover"
                  onClick={() => navigate(`/result/${resolvedId}/heatmap${search}`)}
                >
                  히트맵에서 보기
                  <ArrowRight className="size-4" />
                </CommonButton>
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
                  emptyDescription="시뮬레이션을 시작하면 이슈 카테고리 분류가 표시됩니다."
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
                      <p className="text-caption-12-medium text-text-secondary">
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
              <IssueCard key={issue.id} issue={issue} onOpenDetail={setSelectedIssue} />
            ))}
          </div>
        </section>
      </div>

      <IssueDetailSheet
        issue={selectedIssue}
        open={Boolean(selectedIssue)}
        onOpenChange={(open) => !open && setSelectedIssue(null)}
        onNavigateAiFix={() => navigate(`/result/${resolvedId}/ai${search}`)}
      />
    </div>
  )
}

export default ResultIssuesPage
