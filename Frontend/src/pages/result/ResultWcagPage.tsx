import type { ComponentType } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

import { AlertCircle, ChevronDown, ClipboardCheck, ShieldCheck, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"
import type { WcagDetailIssue, WcagIssueDistribution, WcagPageResult, WcagSeverity } from "@/mocks/result-wcag.mock"
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

const severityLabelMap: Record<WcagSeverity, string> = {
  critical: "Critical 이슈",
  moderate: "Moderate 이슈",
  minor: "Minor 이슈",
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

function DistributionSummary({
  distribution,
  activeSeverity,
  onSelectSeverity,
}: {
  distribution: WcagIssueDistribution[]
  activeSeverity: WcagSeverity | "all"
  onSelectSeverity: (severity: WcagSeverity) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {distribution.map((item) => {
        const style = severityStyleMap[item.severity]
        const selected = activeSeverity === item.severity
        return (
          <button
            key={item.severity}
            type="button"
            className={cn(
              "grid place-items-center gap-1 rounded-2xl border bg-card px-4 py-3 text-center transition-colors",
              selected
                ? "border-border-soft-2 bg-surface-subtle shadow-sm"
                : "border-border-subtle hover:bg-surface-hover-2"
            )}
            onClick={() => onSelectSeverity(item.severity)}
          >
            <p className="text-title-24-bold text-text-strong">{item.count}</p>
            <p className={cn("text-caption-12-medium", style.text)}>{item.label}</p>
            <p className="text-caption-12-regular text-text-subtle">{item.description}</p>
            <span className={cn("mt-2 h-0.5 w-8 rounded-full", style.bar)} aria-hidden="true" />
          </button>
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
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium",
                    style.badge
                  )}
                >
                  Issue {issue.issueNo}
                </span>
                <p className="truncate text-body-14-medium text-text-body">{issue.title}</p>
              </div>
              <p className="mt-1 text-caption-12-regular text-text-secondary">{issue.summary}</p>
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
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
                <p className="text-caption-12-medium text-text-secondary">검사 기준</p>
                <p className="mt-1 text-caption-12-regular text-text-body">{issue.criterion}</p>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
                <p className="text-caption-12-medium text-text-secondary">문제 설명</p>
                <p className="mt-1 text-caption-12-regular leading-relaxed text-text-body">{issue.description}</p>
              </div>

              <div className="rounded-2xl border border-border-soft bg-brand-subtle/60 px-4 py-3">
                <p className="text-caption-12-medium text-text-link">수정 가이드</p>
                <p className="mt-1 text-caption-12-regular leading-relaxed text-text-body">{issue.guidance}</p>
              </div>

              <div className="grid gap-1">
                <p className="text-caption-12-medium text-text-subtle">영향받는 요소</p>
                <code className="w-fit rounded-xl bg-surface-muted px-3 py-2 text-[12px] text-text-body">
                  {issue.selector}
                </code>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultWcagPage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [activeSeverity, setActiveSeverity] = useState<WcagSeverity | "all">("all")
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const [expandedPageIds, setExpandedPageIds] = useState<string[]>(() => [selectedPageId])
  const issuesSectionRef = useRef<HTMLElement>(null)

  const selectedPage: WcagPageResult =
    wcagResultMock.pageResults.find((page) => page.pageId === selectedPageId) ?? wcagResultMock.pageResults[0]

  const distributionTotal = useMemo(
    () => selectedPage.distribution.reduce((acc, item) => acc + item.count, 0),
    [selectedPage]
  )

  const sidePages = useMemo(
    () =>
      resultPagesMock.map((page) => {
        const foundPage = wcagResultMock.pageResults.find((item) => item.pageId === page.id)
        return {
          id: page.id,
          name: page.name,
          screenshotUrl: page.screenshotUrl,
          metaText: `${foundPage?.foundIssues ?? 0}건 이슈`,
        }
      }),
    []
  )

  const filteredDetails = useMemo(() => {
    if (activeSeverity === "all") return selectedPage.details
    return selectedPage.details.filter((issue) => issue.severity === activeSeverity)
  }, [activeSeverity, selectedPage])
  const toggleExpandedPage = (pageId: string) => {
    setExpandedPageIds((prev) => (prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]))
  }

  useEffect(() => {
    setExpandedPageIds((prev) => (prev.includes(selectedPageId) ? prev : [...prev, selectedPageId]))
    setActiveSeverity("all")
    setExpandedIds(new Set())
  }, [selectedPageId])

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageIds={expandedPageIds}
        onSelectPage={(pageId) => {
          setSelectedPageId(pageId)
          setExpandedPageIds((prev) => (prev.includes(pageId) ? prev : [...prev, pageId]))
        }}
        onExpandPage={toggleExpandedPage}
      />

      <div className="grid gap-5">
        <section className="grid gap-3 md:grid-cols-3">
            <MetricCard
              title="준수 점수"
              value={`${selectedPage.complianceScore}%`}
              subtitle={selectedPage.wcagLabel}
              icon={<ShieldCheck className="size-4" />}
            />
            <MetricCard
              title="통과된 테스트"
              value={`${selectedPage.passedTests}`}
              subtitle={`${selectedPage.totalTests}개 테스트 중`}
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
                  <p className="text-title-24-bold text-text-strong">{selectedPage.foundIssues}</p>
                  <p className="text-caption-12-regular text-text-subtle">{selectedPage.foundIssues}건 발견됨</p>
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
              {activeSeverity !== "all" ? (
                <button
                  type="button"
                  className="text-caption-12-medium text-text-link hover:text-primary-600"
                  onClick={() => setActiveSeverity("all")}
                >
                  전체 보기로 돌아가기
                </button>
              ) : null}
            </div>

            <DistributionBar distribution={selectedPage.distribution} />
            <DistributionSummary
              distribution={selectedPage.distribution}
              activeSeverity={activeSeverity}
              onSelectSeverity={(severity) => {
                setActiveSeverity(severity)
                issuesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            />
          </CardContent>
        </Card>

        <section ref={issuesSectionRef} className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-body-14-medium text-text-body">상세 검사 결과</p>
            <p className="text-caption-12-regular text-text-subtle">
              {activeSeverity === "all"
                ? `${selectedPage.pageName} 전체 이슈`
                : `${selectedPage.pageName} · ${severityLabelMap[activeSeverity]}`}
            </p>
          </div>
          <div className="grid gap-3">
            {filteredDetails.map((issue) => {
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
    </div>
  )
}

export default ResultWcagPage
