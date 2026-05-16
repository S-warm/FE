import { useMemo } from "react"
import { useParams } from "react-router-dom"

import { AlertCircle, Clock, Flag, Users } from "lucide-react"

import { HorizontalBarChart, LineTrendChart } from "@/components/charts"
import { EmptyState } from "@/components/sections"
import { ErrorState, PageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useResultOverviewQuery } from "@/queries"
import type { BarChartDatumViewModel } from "@/types/view-model/common/chart"

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-3 px-5 py-4">
        <div className="flex items-center justify-between text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-surface-muted">
              {icon}
            </span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <span className="grid size-6 place-items-center rounded-lg" aria-hidden="true">
            <AlertCircle className="size-4" />
          </span>
        </div>
        <div className="grid gap-1">
          <p className="text-title-24-bold text-text-strong">{value}</p>
          <p className="text-caption-12-regular text-text-subtle">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  badge,
  children,
}: {
  title: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-4 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <p className="text-body-14-medium text-text-body">{title}</p>
          </div>
          {badge ? (
            <div className="rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
              <p className="text-caption-12-medium text-text-secondary">{badge}</p>
            </div>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function buildMetricBars(
  source: Array<{ ageBand: string; value: number }>,
  highlightMode: "min" | "max",
  highlightColor: string,
  mutedColor: string
) {
  if (!source.length) {
    return []
  }

  const scores = source.map((item) => item.value)
  const target = highlightMode === "min" ? Math.min(...scores) : Math.max(...scores)

  return source.map<BarChartDatumViewModel>((item) => ({
    label: item.ageBand,
    score: item.value,
    color: item.value === target ? highlightColor : mutedColor,
  }))
}

function buildHighlightBadge(
  source: Array<{ ageBand: string; value: number }>,
  mode: "min" | "max",
  suffix: string
) {
  if (!source.length) {
    return undefined
  }

  const target =
    mode === "min"
      ? source.reduce((prev, current) => (current.value < prev.value ? current : prev))
      : source.reduce((prev, current) => (current.value > prev.value ? current : prev))

  return `${mode === "min" ? "가장 낮음" : "가장 높음"} ${target.ageBand} ${target.value}${suffix}`
}

function buildMaxBadge(
  source: Array<{ ageBand: string; value: number }>,
  prefix: string,
  formatter: (value: number) => string
) {
  if (!source.length) {
    return undefined
  }

  const target = source.reduce((prev, current) =>
    current.value > prev.value ? current : prev
  )

  return `${prefix} ${target.ageBand} ${formatter(target.value)}`
}

function formatMinutes(value: number) {
  return `${value.toFixed(1)}분`
}

function formatActions(value: number) {
  return `${value.toFixed(1)}회`
}

function formatDeclareFailure(value: number) {
  return `${value.toFixed(2)}회`
}

function resolveUpperBound(values: number[], fallback: number) {
  if (!values.length) {
    return fallback
  }

  const maxValue = Math.max(...values)
  return Math.max(fallback, Number((maxValue * 1.15).toFixed(1)))
}

function ResultOverviewPage() {
  const { simulationId } = useParams()
  const resolvedId = simulationId ?? ""
  const { data, isLoading, isError, refetch } = useResultOverviewQuery(resolvedId)

  const ageStats = useMemo(() => data?.ageStats ?? [], [data])

  const successRateBars = useMemo(
    () =>
      buildMetricBars(
        ageStats.map((item) => ({ ageBand: item.ageBand, value: item.successRate })),
        "min",
        "var(--color-chart-landing)",
        "var(--color-primary-100)"
      ),
    [ageStats]
  )

  const failureRateBars = useMemo(
    () =>
      buildMetricBars(
        ageStats.map((item) => ({
          ageBand: item.ageBand,
          value: item.failureRate ?? 0,
        })),
        "max",
        "var(--color-persona-fifty)",
        "var(--color-chart-failure-muted)"
      ),
    [ageStats]
  )

  const durationSource = useMemo(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        avgDurationMinutes: item.avgDurationMinutes ?? 0,
      })),
    [ageStats]
  )

  const actionSource = useMemo(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        avgActions: item.avgActions ?? 0,
      })),
    [ageStats]
  )

  const declareFailureSource = useMemo(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        avgDeclareFailure: item.avgDeclareFailure ?? 0,
      })),
    [ageStats]
  )

  if (isLoading) {
    return <PageSkeleton className={motion.page} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Overview 데이터를 불러오지 못했습니다"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 시도"
        onAction={() => {
          void refetch()
        }}
      />
    )
  }

  if (!data || ageStats.length === 0) {
    return (
      <EmptyState
        title="Overview 데이터가 없습니다"
        description="시뮬레이션 결과가 준비되면 이 페이지에 표시됩니다."
      />
    )
  }

  return (
    <div className={cn("grid gap-5", motion.page)}>
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard
          title="테스트 성공률"
          value={data.summary.taskSuccessRateLabel}
          description="success_count / total_sessions"
          icon={<Flag className="size-4" />}
        />
        <MetricCard
          title="전체 세션 수"
          value={data.summary.totalAgentsLabel}
          description="summary.total_sessions"
          icon={<Users className="size-4" />}
        />
        <MetricCard
          title="평균 완료 시간"
          value={data.summary.avgCompletionTimeLabel}
          description="summary.avg_duration_ms"
          icon={<Clock className="size-4" />}
        />
        <MetricCard
          title="이탈 세션 수"
          value={data.summary.dropOffAgentsLabel}
          description="total_sessions - success_count"
          icon={<AlertCircle className="size-4" />}
        />
      </section>

      <section className="grid gap-3">
        <ChartCard
          title="연령대별 성공률"
          badge={buildHighlightBadge(
            ageStats.map((item) => ({
              ageBand: item.ageBand,
              value: item.successRate,
            })),
            "min",
            "%"
          )}
        >
          <HorizontalBarChart
            data={successRateBars}
            barColor="var(--color-chart-landing)"
            mutedBarColor="var(--color-primary-100)"
            highlightMode="min"
            heightClassName="h-[250px]"
            emptyTitle="성공률 데이터가 없습니다"
          />
        </ChartCard>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartCard
          title="연령대별 평균 완료 시간"
          badge={buildMaxBadge(
            ageStats.map((item) => ({
              ageBand: item.ageBand,
              value: item.avgDurationMinutes ?? 0,
            })),
            "가장 오래 걸림",
            formatMinutes
          )}
        >
          <LineTrendChart
            data={durationSource}
            dataKey="label"
            valueKey="avgDurationMinutes"
            stroke="var(--color-persona-eighty)"
            domain={[0, resolveUpperBound(durationSource.map((item) => item.avgDurationMinutes), 1)]}
            heightClassName="h-[250px]"
            yAxisTickFormatter={formatMinutes}
            tooltipFormatter={formatMinutes}
            emptyTitle="완료 시간 데이터가 없습니다"
          />
        </ChartCard>

        <ChartCard
          title="연령대별 실패율"
          badge={buildHighlightBadge(
            ageStats.map((item) => ({
              ageBand: item.ageBand,
              value: item.failureRate ?? 0,
            })),
            "max",
            "%"
          )}
        >
          <HorizontalBarChart
            data={failureRateBars}
            barColor="var(--color-persona-fifty)"
            mutedBarColor="var(--color-chart-failure-muted)"
            highlightMode="max"
            heightClassName="h-[220px]"
            emptyTitle="실패율 데이터가 없습니다"
          />
        </ChartCard>

        <ChartCard
          title="연령대별 평균 액션 수"
          badge={buildMaxBadge(
            ageStats.map((item) => ({
              ageBand: item.ageBand,
              value: item.avgActions ?? 0,
            })),
            "가장 많음",
            formatActions
          )}
        >
          <LineTrendChart
            data={actionSource}
            dataKey="label"
            valueKey="avgActions"
            stroke="var(--color-chart-field-input)"
            domain={[0, resolveUpperBound(actionSource.map((item) => item.avgActions), 1)]}
            heightClassName="h-[220px]"
            yAxisTickFormatter={formatActions}
            tooltipFormatter={formatActions}
            emptyTitle="액션 수 데이터가 없습니다"
          />
        </ChartCard>

        <ChartCard
          title="연령대별 평균 declare failure 횟수"
          badge={buildMaxBadge(
            ageStats.map((item) => ({
              ageBand: item.ageBand,
              value: item.avgDeclareFailure ?? 0,
            })),
            "가장 많음",
            formatDeclareFailure
          )}
        >
          <LineTrendChart
            data={declareFailureSource}
            dataKey="label"
            valueKey="avgDeclareFailure"
            stroke="var(--color-chart-validation)"
            domain={[0, resolveUpperBound(declareFailureSource.map((item) => item.avgDeclareFailure), 1)]}
            heightClassName="h-[240px]"
            yAxisTickFormatter={formatDeclareFailure}
            tooltipFormatter={formatDeclareFailure}
            emptyTitle="declare failure 데이터가 없습니다"
          />
        </ChartCard>
      </section>
    </div>
  )
}

export default ResultOverviewPage
