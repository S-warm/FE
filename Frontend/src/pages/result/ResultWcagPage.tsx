import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import {
  AlertCircle,
  ClipboardCheck,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"

import { EmptyState } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { resolveResultPageScreenshotSet } from "@/features/result/assets"
import { motion } from "@/lib/motion"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { cn } from "@/lib/utils"

const WCAG_CRITERIA_LABEL: Record<string, string> = {
  "1.1.1": "대체 텍스트",
  "1.3.1": "정보 및 구조",
  "1.3.5": "입력 목적 식별",
  "1.3.6": "목적 식별",
  "1.4.1": "색상 사용",
  "1.4.3": "명도 대비",
  "1.4.4": "텍스트 크기 조절",
  "2.1.1": "키보드 접근성",
  "2.4.1": "블록 건너뛰기",
  "2.4.2": "페이지 제목",
  "2.4.4": "링크 목적",
  "2.4.6": "제목과 레이블",
  "2.4.7": "포커스 표시",
  "2.4.8": "위치 정보",
  "2.5.5": "타겟 크기",
  "3.3.2": "레이블 또는 지침",
  "3.3.3": "오류 수정 제안",
  "3.3.4": "오류 방지",
  "4.1.2": "이름·역할·값",
  "4.1.3": "상태 메시지",
}
import { useResultWcagQuery, useResultIssuesQuery } from "@/queries"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"
import type {
  ResultWcagDistributionItemViewModel,
  ResultWcagIssueViewModel,
  ResultWcagPageViewModel,
} from "@/types/view-model/result/result-wcag"

function resolveErrorDescription(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

function MetricHelpTooltip({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <div className="group/metric-help relative">
      <button
        type="button"
        className="grid size-6 place-items-center rounded-lg transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={`${label} 설명 보기`}
      >
        <AlertCircle className="size-4" />
      </button>
      <div className="pointer-events-none absolute right-0 top-8 z-20 w-64 rounded-2xl border border-border-strong bg-card px-3 py-3 text-left opacity-0 shadow-xl transition-all duration-150 group-hover/metric-help:translate-y-0 group-hover/metric-help:opacity-100 group-focus-within/metric-help:translate-y-0 group-focus-within/metric-help:opacity-100 translate-y-1">
        <p className="text-caption-12-medium text-text-body">{label}</p>
        <p className="mt-1 text-caption-12-regular leading-relaxed text-text-muted">
          {description}
        </p>
      </div>
    </div>
  )
}

function getSeverityStyle(severity: SeverityTokenViewModel) {
  switch (severity.rank) {
    case 3:
      return {
        bar: "bg-critical-accent",
        badge: "border-critical-accent/40 bg-danger-surface text-critical-text",
        iconWrapper: "bg-danger-surface text-critical-text",
        text: "text-critical-text",
        icon: TriangleAlert,
      }
    case 2:
      return {
        bar: "bg-moderate-accent",
        badge: "border-moderate-accent/50 bg-warning-surface text-moderate-text",
        iconWrapper: "bg-warning-surface text-moderate-text",
        text: "text-moderate-text",
        icon: AlertCircle,
      }
    default:
      return {
        bar: "bg-border-soft",
        badge: "border-border-soft bg-surface-muted text-text-secondary",
        iconWrapper: "bg-surface-muted text-text-secondary",
        text: "text-text-secondary",
        icon: ShieldCheck,
      }
  }
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  helpText,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  helpText: string
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-card shadow-none",
        motion.card,
      )}
    >
      <CardContent className="grid min-h-[120px] gap-3 px-5 py-4">
        <div className="flex items-start justify-between gap-3 text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-xl bg-surface-muted text-text-muted">
              {icon}
            </span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <MetricHelpTooltip label={title} description={helpText} />
        </div>
        <div className="grid gap-1">
          <p className="text-title-24-bold text-text-strong">{value}</p>
          {subtitle ? (
            <p className="text-caption-12-regular text-text-subtle">{subtitle}</p>
          ) : (
            <div className="h-5" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DistributionBar({
  distribution,
}: {
  distribution: ResultWcagDistributionItemViewModel[]
}) {
  const total = distribution.reduce((acc, item) => acc + item.count, 0) || 1

  return (
    <div className="overflow-hidden rounded-xl border border-border-soft bg-surface-subtle">
      <div className="flex h-4 w-full">
        {distribution.map((item) => {
          const style = getSeverityStyle(item.severity)
          return (
            <div
              key={item.severity.raw}
              className={cn(
                "h-full transition-[width] duration-500 ease-out",
                style.bar
              )}
              style={{ width: `${(item.count / total) * 100}%` }}
              aria-label={`${item.label} ${item.count}`}
            />
          )
        })}
      </div>
    </div>
  )
}

function DistributionSummary({
  distribution,
  activeSeverityRaws,
  onToggleSeverity,
}: {
  distribution: ResultWcagDistributionItemViewModel[]
  activeSeverityRaws: Set<string>
  onToggleSeverity: (severityRaw: string) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {distribution.map((item) => {
        const style = getSeverityStyle(item.severity)
        const isActive = activeSeverityRaws.has(item.severity.raw)

        return (
          <button
            type="button"
            key={item.severity.raw}
            onClick={() => onToggleSeverity(item.severity.raw)}
            aria-pressed={isActive}
            className={cn(
              "grid place-items-center gap-1 rounded-2xl border bg-card px-4 py-3 text-center transition-all",
              isActive
                ? "border-border-focus ring-2 ring-ring/30"
                : "border-border-subtle hover:border-border-strong hover:bg-surface-subtle"
            )}
          >
            <p className="text-title-24-bold text-text-strong">{item.count}</p>
            <p className={cn("text-caption-12-medium", style.text)}>{item.label}</p>
            <p className="text-caption-12-regular text-text-subtle">
              {item.description}
            </p>
            <span
              className={cn("mt-2 h-0.5 w-8 rounded-full", style.bar)}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}

function DetailIssueRow({
  issue,
}: {
  issue: ResultWcagIssueViewModel
}) {
  const style = getSeverityStyle(issue.severity)
  const Icon = style.icon
  const [isCodeExpanded, setIsCodeExpanded] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<"idle" | "success" | "error">("idle")
  const hasLongHtml = (issue.htmlElement?.length ?? 0) > 220

  useEffect(() => {
    if (copyFeedback === "idle") return

    const timeoutId = window.setTimeout(() => {
      setCopyFeedback("idle")
    }, 1500)

    return () => window.clearTimeout(timeoutId)
  }, [copyFeedback])

  async function handleCopyHtml() {
    if (!issue.htmlElement) return

    try {
      await navigator.clipboard.writeText(issue.htmlElement)
      setCopyFeedback("success")
    } catch {
      setCopyFeedback("error")
    }
  }

  return (
    <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
      <CardContent className="px-5 py-4">
        <div className="flex w-full items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-xl",
                style.iconWrapper,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium",
                    style.badge,
                  )}
                >
                  {issue.wcagCriteria
                    ? (WCAG_CRITERIA_LABEL[issue.wcagCriteria] ?? issue.wcagCriteria)
                    : issue.wcagIssueId}
                </span>
                <p className="truncate text-body-14-medium text-text-body">
                  {issue.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
                <p className="mb-2 text-caption-12-medium text-text-secondary">설명</p>
                <p className="text-caption-12-regular leading-relaxed text-text-body">
                  {issue.description}
                </p>
              </div>
              {issue.htmlElement ? (
                <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-caption-12-medium text-text-secondary">
                      관련 HTML 요소
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyHtml}
                        className="rounded-lg border border-border-soft bg-card px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                      >
                        {copyFeedback === "success"
                          ? "복사됨"
                          : copyFeedback === "error"
                            ? "복사 실패"
                            : "복사"}
                      </button>
                      {hasLongHtml ? (
                        <button
                          type="button"
                          onClick={() => setIsCodeExpanded((prev) => !prev)}
                          className="rounded-lg border border-border-soft bg-card px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-surface-hover"
                          aria-expanded={isCodeExpanded}
                        >
                          {isCodeExpanded ? "접기" : "펼치기"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <code
                    className={cn(
                      "block w-full overflow-x-auto overflow-y-auto break-words whitespace-pre-wrap rounded-xl bg-code-surface p-3 text-[12px] leading-relaxed text-white transition-[max-height] duration-300",
                      isCodeExpanded ? "max-h-[420px]" : "max-h-[160px]"
                    )}
                  >
                    {issue.htmlElement}
                  </code>
                </div>
              ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function ResultWcagPage() {
  const { simulationId } = useParams()
  const resolvedId = simulationId ?? "unknown"
  const [activeSeverityRawsByPage, setActiveSeverityRawsByPage] = useState<Record<string, string[]>>({})
  const { data, error, isLoading, isError, refetch } = useResultWcagQuery(resolvedId)
  // Fetch Issues data for sidebar pages only (temporary workaround until WCAG backend provides pageUrl)
  const { data: issuesData } = useResultIssuesQuery(resolvedId)
  const pages = useMemo(() => data?.pages ?? [], [data])
  // Use Issues page IDs for sidebar selection (since sidebar uses Issues data)
  const issuePages = useMemo(() => issuesData?.pages ?? [], [issuesData])
  const pageIds = issuePages.map((page) => page.pageId)
  const { selectedPageId, setSelectedPageId } = useResultPageParam({
    availablePageIds: pageIds,
    defaultPageId: pageIds[0],
  })
  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(
    selectedPageId,
    pageIds,
  )

  const selectedPage = useMemo<ResultWcagPageViewModel | null>(
    () => pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId],
  )
  const activeSeverityRaws = useMemo(
    () => new Set(activeSeverityRawsByPage[selectedPageId] ?? []),
    [activeSeverityRawsByPage, selectedPageId],
  )

  const distributionTotal = useMemo(
    () =>
      selectedPage?.distribution.reduce(
        (sum, distributionItem) => sum + distributionItem.count,
        0,
      ) ?? 0,
    [selectedPage],
  )

  const filteredIssues = useMemo(() => {
    const issues = selectedPage?.issues ?? []

    if (!activeSeverityRaws.size) {
      return issues
    }

    return issues.filter((issue) => activeSeverityRaws.has(issue.severity.raw))
  }, [activeSeverityRaws, selectedPage])

  function handleToggleSeverity(severityRaw: string) {
    setActiveSeverityRawsByPage((prev) => {
      const current = new Set(prev[selectedPageId] ?? [])

      if (current.has(severityRaw)) {
        current.delete(severityRaw)
      } else {
        current.add(severityRaw)
      }

      return {
        ...prev,
        [selectedPageId]: Array.from(current),
      }
    })
  }

  function handleResetSeverityFilter() {
    setActiveSeverityRawsByPage((prev) => ({
      ...prev,
      [selectedPageId]: [],
    }))
  }

  // Use Issues pages for sidebar (temporary workaround)
  // WCAG data still displays in main content area
  const sidePages = useMemo(
    () => {
      const issuePages = issuesData?.pages ?? []
      return issuePages.map((page) => {
        const screenshotSet = resolveResultPageScreenshotSet({
          pageId: page.pageId,
          screenshotUrl: page.screenshotUrl,
        })

        return {
          id: page.pageId,
          name: page.pageName,
          url: page.pageUrl,
          previewUrl: screenshotSet.previewUrl,
        }
      })
    },
    [issuesData],
  )

  if (isLoading) {
    return <ResultPageSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="WCAG 데이터를 불러오지 못했습니다"
        description={resolveErrorDescription(
          error,
          "잠시 후 다시 시도해 주세요."
        )}
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
        title="WCAG 검사 결과가 없습니다"
        description="선택한 시뮬레이션에 연결된 WCAG 검사 데이터가 아직 없습니다."
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
            title="WCAG 검사 결과가 없습니다"
            description="선택한 페이지에 연결된 WCAG 검사 데이터가 아직 없습니다."
          />
        ) : null}

        <section className="grid gap-3 md:grid-cols-3">
          <MetricCard
            title="접근성 점수"
            value={`${Math.round(selectedPage?.summary.complianceScore ?? 0)}점`}
            subtitle="사이트를 누구나 쓸 수 있는 정도"
            icon={<ShieldCheck className="size-4" />}
            helpText="WCAG 2.1 위반 항목의 심각도를 반영해 계산한 100점 만점 지표"
          />
          <MetricCard
            title="통과한 테스트"
            value={`${selectedPage?.summary.passedTests ?? 0}개`}
            subtitle="기준을 충족한 항목 수"
            icon={<ClipboardCheck className="size-4" />}
            helpText="axe-core 검사에서 기준을 충족한 항목 수"
          />
          <Card
            className={cn(
              "rounded-2xl border border-border-strong bg-card shadow-none",
              motion.card,
            )}
          >
            <CardContent className="grid min-h-[120px] gap-3 px-5 py-4">
              <div className="flex items-start justify-between gap-3 text-text-subtle">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-xl bg-surface-muted text-text-muted">
                    <TriangleAlert className="size-4" />
                  </span>
                  <p className="text-caption-12-medium">발견된 이슈</p>
                </div>
                <MetricHelpTooltip
                  label="발견된 이슈"
                  description="가이드라인 위반으로 탐지된 항목 수"
                />
              </div>
              <div className="grid gap-1">
                <p className="text-title-24-bold text-text-strong">
                  {`${selectedPage?.summary.foundIssues ?? 0}개`}
                </p>
                <p className="text-caption-12-regular text-text-subtle">
                  개선이 필요한 항목 수
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card
          className={cn(
            "rounded-2xl border border-border-strong bg-card shadow-none",
            motion.card,
          )}
        >
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-body-14-medium text-text-body">검출 이슈 분석</p>
              <Badge
                variant="secondary"
                className="h-7 rounded-full bg-brand-subtle px-3 text-sm text-text-link"
              >
                전체 {distributionTotal}건
              </Badge>
            </div>

            <DistributionBar distribution={selectedPage?.distribution ?? []} />
            <DistributionSummary
              distribution={selectedPage?.distribution ?? []}
              activeSeverityRaws={activeSeverityRaws}
              onToggleSeverity={handleToggleSeverity}
            />
          </CardContent>
        </Card>

        <section className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-body-14-medium text-text-body">상세 검사 결과</p>
            {activeSeverityRaws.size ? (
              <button
                type="button"
                onClick={handleResetSeverityFilter}
                className="rounded-full border border-border-soft px-3 py-1.5 text-caption-12-medium text-text-secondary transition-colors hover:bg-surface-hover"
              >
                필터 초기화
              </button>
            ) : null}
          </div>
          {selectedPage && filteredIssues.length > 0 ? (
            <div className="grid gap-3">
              {filteredIssues.map((issue) => (
                <DetailIssueRow
                  key={issue.wcagIssueId}
                  issue={issue}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={activeSeverityRaws.size ? "선택한 심각도의 이슈가 없습니다" : "상세 검사 결과가 없습니다"}
              description={
                activeSeverityRaws.size
                  ? "다른 심각도 카드를 선택하거나 필터를 해제해 전체 이슈를 확인해 보세요."
                  : "표시할 상세 이슈가 없거나 아직 검사 데이터가 연결되지 않았습니다."
              }
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default ResultWcagPage
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            