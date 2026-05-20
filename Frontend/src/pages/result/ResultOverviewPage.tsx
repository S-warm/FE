import { useMemo } from "react"
import { useParams } from "react-router-dom"

import { AlertCircle, Clock, Flag, Users } from "lucide-react"

import { HorizontalBarChart, LineTrendChart, LollipopChart, StackedBarChart } from "@/components/charts"
import type { StackedBarDatumViewModel } from "@/components/charts"
import { EmptyState } from "@/components/sections"
import { ErrorState, PageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { getAgeBandColor } from "@/lib/age-band-colors"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-caption-12-medium text-text-secondary whitespace-nowrap">{children}</p>
      <div className="h-px flex-1 bg-border-strong" />
    </div>
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
          <p className="text-body-14-medium text-text-body">{title}</p>
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

function buildHighlightBadge(
  source: Array<{ ageBand: string; value: number }>,
  mode: "min" | "max",
  suffix: string
) {
  if (!source.length) return undefined
  const target =
    mode === "min"
      ? source.reduce((prev, cur) => (cur.value < prev.value ? cur : prev))
      : source.reduce((prev, cur) => (cur.value > prev.value ? cur : prev))
  return `${mode === "min" ? "가장 낮음" : "가장 높음"} ${target.ageBand} ${target.value}${suffix}`
}

function buildMaxBadge(
  source: Array<{ ageBand: string; value: number }>,
  prefix: string,
  formatter: (value: number) => string
) {
  if (!source.length) return undefined
  const target = source.reduce((prev, cur) => (cur.value > prev.value ? cur : prev))
  return `${prefix} ${target.ageBand} ${formatter(target.value)}`
}

function resolveUpperBound(values: number[], fallback: number) {
  if (!values.length) return fallback
  const maxValue = Math.max(...values)
  return Math.max(fallback, Number((maxValue * 1.2).toFixed(1)))
}

const formatMinutes = (v: number) => `${v.toFixed(1)}분`
const formatActions = (v: number) => `${v.toFixed(1)}회`
const formatDeclareFailure = (v: number) => `${v.toFixed(2)}회`

function ResultOverviewPage() {
  const { simulationId } = useParams()
  const resolvedId = simulationId ?? ""
  const { data, isLoading, isError, refetch } = useResultOverviewQuery(resolvedId)

  const ageStats = useMemo(() => data?.ageStats ?? [], [data])

  const successFailureData = useMemo<StackedBarDatumViewModel[]>(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        success: item.successRate,
        failure: item.failureRate ?? 0,
        successColor: getAgeBandColor(item.ageBand, "primary"),
        failureColor: getAgeBandColor(item.ageBand, "muted"),
      })),
    [ageStats]
  )

  const durationBars = useMemo<BarChartDatumViewModel[]>(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        score: item.avgDurationMinutes ?? 0,
        color: getAgeBandColor(item.ageBand, "primary"),
      })),
    [ageStats]
  )

  const actionBars = useMemo<BarChartDatumViewModel[]>(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        score: item.avgActions ?? 0,
        color: getAgeBandColor(item.ageBand, "primary"),
      })),
    [ageStats]
  )

  const declareFailureBars = useMemo<BarChartDatumViewModel[]>(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        score: item.avgDeclareFailure ?? 0,
        color: getAgeBandColor(item.ageBand, "primary"),
      })),
    [ageStats]
  )

  if (isLoading) return <PageSkeleton className={motion.page} />

  if (isError) {
    return (
      <ErrorState
        title="Overview 데이터를 불러오지 못했습니다"
        description="시뮬레이션이 존재하지 않거나 아직 분석이 완료되지 않았을 수 있습니다."
        actionLabel="다시 시도"
        onAction={() => { void refetch() }}
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
      {/* 요약 카드 */}
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard
          title="테스트 성공률"
          value={data.summary.taskSuccessRateLabel}
          description="성공한 세션 수 / 전체 세션 수"
          icon={<Flag className="size-4" />}
        />
        <MetricCard
          title="전체 세션 수"
          value={data.summary.totalAgentsLabel}
          description="전체 시뮬레이션 세션 수"
          icon={<Users className="size-4" />}
        />
        <MetricCard
          title="평균 완료 시간"
          value={data.summary.avgCompletionTimeLabel}
          description="성공한 세션 기준"
          icon={<Clock className="size-4" />}
        />
        <MetricCard
          title="이탈 세션 수"
          value={data.summary.dropOffAgentsLabel}
          description="전체 세션 수 - 성공한 세션 수"
          icon={<AlertCircle className="size-4" />}
        />
      </section>

      {/* 성과 지표 */}
      <section className="grid gap-3">
        <SectionLabel>성과 지표</SectionLabel>
        <ChartCard
          title="연령대별 성공 / 실패율"
          badge={buildHighlightBadge(
            ageStats.map((item) => ({ ageBand: item.ageBand, value: item.successRate })),
            "min",
            "%"
          )}
        >
          <StackedBarChart
            data={successFailureData}
            heightClassName="h-[280px]"
            emptyTitle="성공/실패 데이터가 없습니다"
          />
        </ChartCard>
      </section>

      {/* 행동 지표 */}
      <section className="grid gap-3">
        <SectionLabel>행동 지표</SectionLabel>
        <div className="grid gap-3 xl:grid-cols-3">
          <ChartCard
            title="연령대별 평균 완료 시간"
            badge={buildMaxBadge(
              ageStats.map((item) => ({ ageBand: item.ageBand, value: item.avgDurationMinutes ?? 0 })),
              "가장 오래 걸림",
              formatMinutes
            )}
          >
            <HorizontalBarChart
              data={durationBars}
              heightClassName="h-[240px]"
              highlightMode="none"
              domain={[0, resolveUpperBound(durationBars.map((d) => d.score), 1)]}
              xAxisTickFormatter={formatMinutes}
              emptyTitle="완료 시간 데이터가 없습니다"
            />
          </ChartCard>

          <ChartCard
            title="연령대별 평균 액션 수"
            badge={buildMaxBadge(
              ageStats.map((item) => ({ ageBand: item.ageBand, value: item.avgActions ?? 0 })),
              "가장 많음",
              formatActions
            )}
          >
            <LollipopChart
              data={actionBars}
              heightClassName="h-[240px]"
              xAxisTickFormatter={formatActions}
              valueFormatter={formatActions}
              domain={[0, resolveUpperBound(actionBars.map((d) => d.score), 1)]}
              emptyTitle="액션 수 데이터가 없습니다"
            />
          </ChartCard>

          <ChartCard
            title="연령대별 탐색 포기율"
            badge={buildHighlightBadge(
              ageStats.map((item) => ({ ageBand: item.ageBand, value: item.avgDeclareFailure ?? 0 })),
              "max",
              "회"
            )}
          >
            <LineTrendChart
              data={ageStats.map((item) => ({
                label: item.ageBand,
                avgDeclareFailure: item.avgDeclareFailure ?? 0,
              }))}
              dataKey="label"
              valueKey="avgDeclareFailure"
              stroke="var(--color-primary-main)"
              domain={[0, resolveUpperBound(ageStats.map((item) => item.avgDeclareFailure ?? 0), 1)]}
              heightClassName="h-[240px]"
              yAxisTickFormatter={formatDeclareFailure}
              tooltipFormatter={formatDeclareFailure}
              emptyTitle="탐색 포기율 데이터가 없습니다"
            />
          </ChartCard>
        </div>
      </section>
    </div>
  )
}

export default ResultOverviewPage
