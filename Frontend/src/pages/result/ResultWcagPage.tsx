import type { ComponentType } from "react"
import { useMemo, useState } from "react"

import { AlertCircle, ChevronDown, ClipboardCheck, ShieldCheck, TriangleAlert } from "lucide-react"

import { EmptyState } from "@/components/sections"
import { Badge } from "@/components/ui/badge"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import type {
  WcagDetailIssue,
  WcagIssueDistribution,
  WcagPageResult,
  WcagSeverity,
} from "@/mocks/result-wcag.mock"
import { wcagResultMock } from "@/mocks/result-wcag.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import { useResultPageParam } from "@/lib/result-page-param"

const severityStyleMap: Record<
  WcagSeverity,
  {
    bar: string
    badge: string
    iconWrapper: string
    text: string
    icon: ComponentType<{ className?: string }>
  }
> = {
  critical: {
    bar: "bg-critical-accent",
    badge: "bg-critical-accent/15 text-critical-text border-critical-accent/30",
    iconWrapper: "bg-danger-surface text-danger-text",
    text: "text-critical-text",
    icon: TriangleAlert,
  },
  moderate: {
    bar: "bg-moderate-accent",
    badge: "bg-moderate-accent/20 text-moderate-text border-moderate-accent/40",
    iconWrapper: "bg-warning-surface text-warning-text",
    text: "text-moderate-text",
    icon: AlertCircle,
  },
  minor: {
    bar: "bg-minor-accent",
    badge: "bg-surface-hover text-text-muted border-border-soft-2",
    iconWrapper: "bg-surface-hover text-text-muted",
    text: "text-text-muted",
    icon: ShieldCheck,
  },
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  rightSlot,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  rightSlot?: React.ReactNode
}) {
  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-3 px-5 py-4">
        <div className="flex items-start justify-between gap-3 text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-xl bg-surface-muted text-text-muted">{icon}</span>
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
          <p className="text-caption-12-regular text-text-subtle">{subtitle}</p>
        </div>
        {rightSlot ? <div className="pt-1">{rightSlot}</div> : null}
      </CardContent>
    </Card>
  )
}

function DistributionBar({ distribution }: { distribution: WcagIssueDistribution[] }) {
  const total = distribution.reduce((acc, item) => acc + item.count, 0) || 1

  return (
    <div className="overflow-hidden rounded-xl border border-border-soft bg-surface-subtle">
      <div className="flex h-4 w-full">
        {distribution.map((item) => {
          const style = severityStyleMap[item.severity]
          return (
            <div
              key={item.severity}
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

function DistributionSummary({ distribution }: { distribution: WcagIssueDistribution[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {distribution.map((item) => {
        const style = severityStyleMap[item.severity]
        return (
          <div
            key={item.severity}
            className="grid place-items-center gap-1 rounded-2xl border border-border-subtle bg-card px-4 py-3"
          >
            <p className="text-title-24-bold text-text-strong">{item.count}</p>
            <p className={cn("text-caption-12-medium", style.text)}>{item.label}</p>
            <p className="text-caption-12-regular text-text-subtle">{item.description}</p>
            <span className={cn("mt-2 h-0.5 w-8 rounded-full", style.bar)} aria-hidden="true" />
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
  issue: WcagDetailIssue
  expanded: boolean
  onToggle: () => void
}) {
  const style = severityStyleMap[issue.severity]
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
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", style.iconWrapper)}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium", style.badge)}>
                  Issue {issue.issueNo}
                </span>
                <p className="truncate text-body-14-medium text-text-body">{issue.title}</p>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-2 text-caption-12-medium text-text-muted">
            자세히 보기
            <ChevronDown className={cn("size-4 transition-transform", expanded ? "rotate-180" : "")} />
          </span>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
              <p className="text-caption-12-regular leading-relaxed text-text-body">{issue.description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultWcagPage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(selectedPageId)

  const selectedPageResult = useMemo<WcagPageResult | null>(() => {
    return (
      wcagResultMock.pageResults.find((pageResult) => pageResult.pageId === selectedPageId) ??
      wcagResultMock.pageResults[0] ??
      null
    )
  }, [selectedPageId])

  const distributionTotal = useMemo(
    () => selectedPageResult?.distribution.reduce((sum, distributionItem) => sum + distributionItem.count, 0) ?? 0,
    [selectedPageResult]
  )

  const sidePages = useMemo(
    () =>
      resultPagesMock.map((page) => ({
        id: page.id,
        name: page.name,
        screenshotUrl: page.screenshotUrl,
      })),
    []
  )

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

      <div className="grid gap-5">
        {!selectedPageResult ? (
          <EmptyState
            title="WCAG 검사 결과가 없습니다"
            description="선택한 페이지에 연결된 WCAG 검사 데이터가 아직 없습니다."
          />
        ) : null}

        <section className="grid gap-3 md:grid-cols-3">
          <MetricCard
            title="준수 점수"
            value={`${selectedPageResult?.complianceScore ?? 0}%`}
            subtitle={selectedPageResult?.wcagLabel ?? "-"}
            icon={<ShieldCheck className="size-4" />}
          />
          <MetricCard
            title="통과된 테스트"
            value={`${selectedPageResult?.passedTests ?? 0}`}
            subtitle={`${selectedPageResult?.totalTests ?? 0}개 테스트 중`}
            icon={<ClipboardCheck className="size-4" />}
          />
          <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
            <CardContent className="grid gap-3 px-5 py-4">
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
                <p className="text-title-24-bold text-text-strong">{selectedPageResult?.foundIssues ?? 0}</p>
                <p className="text-caption-12-regular text-text-subtle">
                  {selectedPageResult?.foundIssues ?? 0}건 발견됨
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-body-14-medium text-text-body">검출 이슈 분석</p>
              <Badge variant="secondary" className="h-7 rounded-full bg-brand-subtle px-3 text-sm text-text-link">
                전체 {distributionTotal}건
              </Badge>
            </div>

            <DistributionBar distribution={selectedPageResult?.distribution ?? []} />
            <DistributionSummary distribution={selectedPageResult?.distribution ?? []} />
          </CardContent>
        </Card>

        <section className="grid gap-3">
          <p className="text-body-14-medium text-text-body">상세 검사 결과</p>
          {selectedPageResult && selectedPageResult.details.length > 0 ? (
            <div className="grid gap-3">
              {selectedPageResult.details.map((issue) => {
                const expanded = expandedIds.has(issue.id)
                return (
                  <DetailIssueRow
                    key={issue.id}
                    issue={issue}
                    expanded={expanded}
                    onToggle={() =>
                      setExpandedIds((prev) => {
                        const next = new Set(prev)
                        if (next.has(issue.id)) next.delete(issue.id)
                        else next.add(issue.id)
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

export default ResultWcagPage
