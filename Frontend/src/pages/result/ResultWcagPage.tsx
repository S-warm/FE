import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import {
  AlertCircle,
  ChevronDown,
  ClipboardCheck,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"

import { EmptyState } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
import { useResultWcagQuery } from "@/queries"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"
import type {
  ResultWcagDistributionItemViewModel,
  ResultWcagIssueViewModel,
  ResultWcagPageViewModel,
} from "@/types/view-model/result/result-wcag"

function getSeverityStyle(severity: SeverityTokenViewModel) {
  switch (severity.raw) {
    case "Critical":
      return {
        bar: "bg-critical-accent",
        badge:
          "bg-critical-accent/15 text-critical-text border-critical-accent/30",
        iconWrapper: "bg-danger-surface text-danger-text",
        text: "text-critical-text",
        icon: TriangleAlert,
      }
    case "Moderate":
      return {
        bar: "bg-moderate-accent",
        badge:
          "bg-moderate-accent/20 text-moderate-text border-moderate-accent/40",
        iconWrapper: "bg-warning-surface text-warning-text",
        text: "text-moderate-text",
        icon: AlertCircle,
      }
    default:
      return {
        bar: "bg-minor-accent",
        badge: "bg-surface-hover text-text-muted border-border-soft-2",
        iconWrapper: "bg-surface-hover text-text-muted",
        text: "text-text-muted",
        icon: ShieldCheck,
      }
  }
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-card shadow-none",
        motion.card,
      )}
    >
      <CardContent className="grid gap-3 px-5 py-4 min-h-[120px]">
        <div className="flex items-start justify-between gap-3 text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-xl bg-surface-muted text-text-muted">
              {icon}
            </span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <button
            type="button"
            className="grid size-6 place-items-center rounded-lg hover:bg-surface-hover"
            aria-label="도움말"
          >
            <AlertCircle className="size-4" />
          </button>
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
              className={cn("h-full", style.bar)}
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
}: {
  distribution: ResultWcagDistributionItemViewModel[]
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {distribution.map((item) => {
        const style = getSeverityStyle(item.severity)
        return (
          <div
            key={item.severity.raw}
            className="grid place-items-center gap-1 rounded-2xl border border-border-subtle bg-card px-4 py-3"
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
          </div>
        )
      })}
    </div>
  )
}

function DetailIssueRow({
  issue,
  expanded,
  onToggle,
}: {
  issue: ResultWcagIssueViewModel
  expanded: boolean
  onToggle: () => void
}) {
  const style = getSeverityStyle({
    ...issue.severity,
  })
  const Icon = style.icon

  return (
    <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
      <CardContent className="px-5 py-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 text-left"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-xl",
                style.iconWrapper,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium",
                    style.badge,
                  )}
                >
                  {issue.wcagIssueId}
                </span>
                <p className="truncate text-body-14-medium text-text-body">
                  {issue.title}
                </p>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-2 text-caption-12-medium text-text-muted">
            자세히 보기
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                expanded ? "rotate-180" : "",
              )}
            />
          </span>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
                <p className="text-caption-12-medium text-text-secondary mb-2">설명</p>
                <p className="text-caption-12-regular leading-relaxed text-text-body">
                  {issue.description}
                </p>
              </div>
              {issue.htmlElement && (
                <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
                  <p className="text-caption-12-medium text-text-secondary mb-2">관련 HTML 요소</p>
                  <code className="block w-full overflow-x-auto rounded-xl bg-code-surface p-3 text-[12px] text-white leading-relaxed whitespace-pre-wrap break-words">
                    {issue.htmlElement}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultWcagPage() {
  const { simulationId } = useParams()
  const resolvedId = simulationId ?? "unknown"
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const { data, isLoading, isError, refetch } = useResultWcagQuery(resolvedId)
  const pages = useMemo(() => data?.pages ?? [], [data])
  const pageIds = pages.map((page) => page.pageId)
  const { selectedPageId, setSelectedPageId } = useResultPageParam({
    availablePageIds: pageIds,
    defaultPageId: pageIds[0],
  })
  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(
    selectedPageId,
  )

  const selectedPage = useMemo<ResultWcagPageViewModel | null>(
    () => pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId],
  )

  const distributionTotal = useMemo(
    () =>
      selectedPage?.distribution.reduce(
        (sum, distributionItem) => sum + distributionItem.count,
        0,
      ) ?? 0,
    [selectedPage],
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
        title="WCAG 데이터를 불러오지 못했습니다"
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
            title="웹 접근성 점수"
            value={`${Math.round(selectedPage?.summary.complianceScore ?? 0)}점`}
            subtitle=""
            icon={<ShieldCheck className="size-4" />}
          />
          <MetricCard
            title="통과된 테스트"
            value={`${selectedPage?.summary.passedTests ?? 0}개`}
            subtitle=""
            icon={<ClipboardCheck className="size-4" />}
          />
          <Card
            className={cn(
              "rounded-2xl border border-border-strong bg-card shadow-none",
              motion.card,
            )}
          >
            <CardContent className="grid gap-3 px-5 py-4 min-h-[120px]">
              <div className="flex items-start justify-between gap-3 text-text-subtle">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-xl bg-surface-muted text-text-muted">
                    <TriangleAlert className="size-4" />
                  </span>
                  <p className="text-caption-12-medium">발견된 이슈</p>
                </div>
                <button
                  type="button"
                  className="grid size-6 place-items-center rounded-lg hover:bg-surface-hover"
                  aria-label="도움말"
                >
                  <AlertCircle className="size-4" />
                </button>
              </div>
              <div className="grid gap-1">
                <p className="text-title-24-bold text-text-strong">
                  {`${selectedPage?.summary.foundIssues ?? 0}개`}
                </p>
                <div className="h-5" />
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
            <DistributionSummary distribution={selectedPage?.distribution ?? []} />
          </CardContent>
        </Card>

        <section className="grid gap-3">
          <p className="text-body-14-medium text-text-body">상세 검사 결과</p>
          {selectedPage && selectedPage.issues.length > 0 ? (
            <div className="grid gap-3">
              {selectedPage.issues.map((issue) => {
                const expanded = expandedIds.has(issue.wcagIssueId)
                return (
                  <DetailIssueRow
                    key={issue.wcagIssueId}
                    issue={issue}
                    expanded={expanded}
                    onToggle={() =>
                      setExpandedIds((prev) => {
                        const next = new Set(prev)
                        if (next.has(issue.wcagIssueId)) next.delete(issue.wcagIssueId)
                        else next.add(issue.wcagIssueId)
                        return next
                      })
                    }
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="상세 검사 결과가 없습니다"
              description="표시할 상세 이슈가 없거나, 아직 검사 데이터가 연결되지 않았습니다."
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default ResultWcagPa