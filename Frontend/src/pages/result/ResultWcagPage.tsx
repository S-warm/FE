import type { ComponentType } from "react"
import { useMemo, useState } from "react"

import { AlertCircle, ChevronDown, ClipboardCheck, ShieldCheck, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { WcagDetailIssue, WcagIssueDistribution, WcagSeverity } from "@/mocks/result-wcag.mock"
import { wcagResultMock } from "@/mocks/result-wcag.mock"

const severityStyleMap: Record<
  WcagSeverity,
  {
    bar: string
    badge: string
    iconWrapper: string
    icon: ComponentType<{ className?: string }>
  }
> = {
  critical: {
    bar: "bg-critical-accent",
    badge: "bg-critical-accent/15 text-critical-text border-critical-accent/30",
    iconWrapper: "bg-danger-surface text-danger-text",
    icon: TriangleAlert,
  },
  moderate: {
    bar: "bg-moderate-accent",
    badge: "bg-moderate-accent/20 text-moderate-text border-moderate-accent/40",
    iconWrapper: "bg-warning-surface text-warning-text",
    icon: AlertCircle,
  },
  minor: {
    bar: "bg-minor-accent",
    badge: "bg-surface-hover text-text-muted border-border-soft-2",
    iconWrapper: "bg-surface-hover text-text-muted",
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
    <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
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
            <p className={cn("text-title-24-bold", item.severity === "minor" ? "text-text-muted" : "")}>
              {item.count}
            </p>
            <p className={cn("text-caption-12-medium", item.severity === "critical" ? "text-critical-text" : "")}>
              {item.label}
            </p>
            <p
              className={cn(
                "text-caption-12-regular",
                item.severity === "critical" ? "text-critical-text" : "text-text-subtle"
              )}
            >
              {item.description}
            </p>
            <span className={cn("mt-1 h-0.5 w-5 rounded-full", style.bar)} aria-hidden="true" />
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

  const summary = wcagResultMock
  const distributionTotal = useMemo(() => summary.distribution.reduce((acc, item) => acc + item.count, 0), [summary])

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 md:grid-cols-[240px_240px_minmax(0,1fr)]">
        <MetricCard
          title="준수 점수"
          value={`${summary.complianceScore}%`}
          subtitle={summary.wcagLabel}
          icon={<ShieldCheck className="size-4" />}
        />
        <MetricCard
          title="통과된 테스트"
          value={`${summary.passedTests}`}
          subtitle={`${summary.totalTests}개 테스트 중`}
          icon={<ClipboardCheck className="size-4" />}
        />
        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="grid gap-4 px-5 py-4 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
            <div className="grid gap-3">
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
                <p className="text-title-24-bold text-text-strong">{summary.foundIssues}</p>
                <p className="text-caption-12-regular text-text-subtle">{summary.foundIssues}건 발견됨</p>
              </div>
            </div>

            <div className="max-h-[86px] overflow-auto rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
              <div className="grid gap-1">
                {summary.pageFindings.map((item) => (
                  <p key={item.pageName} className="text-caption-12-regular text-text-muted">
                    {item.pageName}: {item.total}건 (높음 {item.breakdown.critical}, 중간 {item.breakdown.moderate}, 낮음{" "}
                    {item.breakdown.minor})
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
        <CardContent className="grid gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-14-medium text-text-body">검출 이슈 분석</p>
            <Badge variant="secondary" className="h-7 rounded-full bg-brand-subtle px-3 text-sm text-text-link">
              전체 {distributionTotal}건
            </Badge>
          </div>

          <DistributionBar distribution={summary.distribution} />
          <DistributionSummary distribution={summary.distribution} />
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">상세 검사 결과</p>
        <div className="grid gap-3">
          {summary.details.map((issue) => {
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
      </section>
    </div>
  )
}

export default ResultWcagPage
