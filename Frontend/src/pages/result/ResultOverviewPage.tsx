import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { AlertCircle, Clock, Flag, Users } from "lucide-react"

import { HorizontalBarChart, LineTrendChart, LollipopChart, StackedBarChart } from "@/components/charts"
import type { StackedBarDatumViewModel } from "@/components/charts"
import { EmptyState } from "@/components/sections"
import { ErrorState, PageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAgeBandColor } from "@/lib/age-band-colors"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useResultOverviewQuery } from "@/queries"
import type { BarChartDatumViewModel } from "@/types/view-model/common/chart"

type ChartLayout = "split" | "combined"
type ChartType = "bar" | "line"

function MetricCard({
  title,
  value,
  description,
  tooltip,
  icon,
}: {
  title: string
  value: string
  description: string
  tooltip: string
  icon: React.ReactNode
}) {
  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] !overflow-visible", motion.card)}>
      <CardContent className="grid gap-3 px-5 py-4">
        <div className="flex items-center justify-between text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-surface-muted">
              {icon}
            </span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <span className="relative grid size-6 place-items-center rounded-lg group cursor-default">
            <AlertCircle className="size-4" />
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-xl border border-border-soft bg-card px-3 py-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
              <p className="text-caption-12-regular text-text-body leading-relaxed">{tooltip}</p>
            </div>
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
  controls,
  children,
}: {
  title: string
  badge?: string
  controls?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]", motion.card)}>
      <CardContent className="grid gap-4 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-body-14-medium text-text-body">{title}</p>
          <div className="flex shrink-0 items-center gap-2">
            {controls}
            {badge ? (
              <div className="rounded-full border border-border-soft bg-surface-subtle px-3 py-1">
                <p className="text-caption-12-medium text-text-secondary">{badge}</p>
              </div>
            ) : null}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function ChartTypeSelect({ value, onChange }: { value: ChartType; onChange: (v: ChartType) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChartType)}>
      <SelectTrigger size="sm">
        <SelectValue>{value === "bar" ? "막대형" : "라인형"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bar">막대형</SelectItem>
        <SelectItem value="line">라인형</SelectItem>
      </SelectContent>
    </Select>
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
const formatDuration = (v: number) => {
  const total = Math.round(v * 60)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}시간 ${m}분 ${s}초`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}
const formatActions = (v: number) => `${v.toFixed(1)}회`
const formatDeclareFailure = (v: number) => `${v.toFixed(2)}회`

function ResultOverviewPage() {
  const { simulationId } = useParams()
  const resolvedId = simulationId ?? ""
  const { data, isLoading, isError, refetch } = useResultOverviewQuery(resolvedId)
  const [chartLayout, setChartLayout] = useState<ChartLayout>("split")
  const [durationChartType, setDurationChartType] = useState<ChartType>("bar")
  const [actionChartType, setActionChartType] = useState<ChartType>("bar")
  const [declareChartType, setDeclareChartType] = useState<ChartType>("line")
  const [highlightedBand, setHighlightedBand] = useState<string | null>(null)

  const ageStats = useMemo(() => data?.ageStats ?? [], [data])

  const successFailureData = useMemo<StackedBarDatumViewModel[]>(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        success: item.successRate,
        failure: item.failureRate ?? 0,
        successColor: getAgeBandColor(item.ageBand, "primary"),
        failureColor: getAgeBandColor(item.ageBand, "failure"),
      })),
    [ageStats]
  )

  const successOnlyBars = useMemo<BarChartDatumViewModel[]>(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        score: item.successRate,
        color: getAgeBandColor(item.ageBand, "primary"),
      })),
    [ageStats]
  )

  const failureOnlyBars = useMemo<BarChartDatumViewModel[]>(
    () =>
      ageStats.map((item) => ({
        label: item.ageBand,
        score: item.failureRate ?? 0,
        color: getAgeBandColor(item.ageBand, "failure"),
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

  const durationLineData = useMemo(
    () => ageStats.map((item) => ({
      label: item.ageBand,
      value: item.avgDurationMinutes ?? 0,
      color: getAgeBandColor(item.ageBand, "primary"),
    })),
    [ageStats]
  )

  const actionLineData = useMemo(
    () => ageStats.map((item) => ({
      label: item.ageBand,
      value: item.avgActions ?? 0,
      color: getAgeBandColor(item.ageBand, "primary"),
    })),
    [ageStats]
  )

  const declareLineData = useMemo(
    () => ageStats.map((item) => ({
      label: item.ageBand,
      avgDeclareFailure: item.avgDeclareFailure ?? 0,
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
          tooltip="시뮬레이션에서 주어진 태스크를 끝까지 완료한 세션의 비율입니다. 높을수록 사용자가 목표를 달성하기 쉬운 UI임을 의미합니다."
          icon={<Flag className="size-4" />}
        />
        <MetricCard
          title="전체 세션 수"
          value={data.summary.totalAgentsLabel}
          description="전체 시뮬레이션 세션 수"
          tooltip="이번 시뮬레이션에 참여한 AI 에이전트의 총 수입니다. 세션 수가 많을수록 결과의 신뢰도가 높아집니다."
          icon={<Users className="size-4" />}
        />
        <MetricCard
          title="평균 완료 시간"
          value={data.summary.avgCompletionTimeLabel}
          description="성공한 세션 기준"
          tooltip="태스크를 성공적으로 완료한 세션만을 대상으로 측정한 평균 소요 시간입니다. 실패 세션은 포함되지 않습니다."
          icon={<Clock className="size-4" />}
        />
        <MetricCard
          title="이탈 세션 수"
          value={data.summary.dropOffAgentsLabel}
          description="전체 세션 수 - 성공한 세션 수"
          tooltip="태스크를 완료하지 못하고 중단된 세션 수입니다. 이탈이 많을수록 UI에서 사용자가 막히는 구간이 있음을 나타냅니다."
          icon={<AlertCircle className="size-4" />}
        />
      </section>

      {/* 성과 지표 */}
      <section className="grid gap-3">
        <SectionLabel>성과 지표</SectionLabel>
        <ChartCard
          title="연령대별 성공 / 실패율"
          badge={
            chartLayout === "combined"
              ? buildHighlightBadge(
                  ageStats.map((item) => ({ ageBand: item.ageBand, value: item.successRate })),
                  "min",
                  "%"
                )
              : undefined
          }
          controls={
            <Select value={chartLayout} onValueChange={(v) => setChartLayout(v as ChartLayout)}>
              <SelectTrigger size="sm">
                <SelectValue>{chartLayout === "split" ? "분리" : "통합"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="split">분리</SelectItem>
                <SelectItem value="combined">통합</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          {chartLayout === "combined" && (
            <StackedBarChart
              data={successFailureData}
              heightClassName="h-[360px]"
              emptyTitle="성공/실패 데이터가 없습니다"
              highlightedLabel={highlightedBand}
              onLabelClick={setHighlightedBand}
            />
          )}
          {chartLayout === "split" && (
            <div className="grid gap-10 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: getAgeBandColor("40대", "primary") }} />
                  <p className="text-caption-12-medium text-text-subtle">성공률</p>
                </div>
                <HorizontalBarChart
                  data={successOnlyBars}
                  heightClassName="h-[280px]"
                  highlightMode="none"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  xAxisTickFormatter={(v) => `${v}%`}
                  tooltipLabel="성공률"
                  tooltipFormatter={(v) => `${v}%`}
                  barSize={18}
                  emptyTitle="성공 데이터가 없습니다"
                  highlightedLabel={highlightedBand}
                  onLabelClick={setHighlightedBand}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: getAgeBandColor("40대", "failure") }} />
                  <p className="text-caption-12-medium text-text-subtle">실패율</p>
                </div>
                <HorizontalBarChart
                  data={failureOnlyBars}
                  heightClassName="h-[280px]"
                  highlightMode="none"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  xAxisTickFormatter={(v) => `${v}%`}
                  tooltipLabel="실패율"
                  tooltipFormatter={(v) => `${v}%`}
                  barSize={18}
                  emptyTitle="실패 데이터가 없습니다"
                  highlightedLabel={highlightedBand}
                  onLabelClick={setHighlightedBand}
                />
              </div>
            </div>
          )}
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
            controls={<ChartTypeSelect value={durationChartType} onChange={setDurationChartType} />}
          >
            {durationChartType === "bar" ? (
              <HorizontalBarChart
                data={durationBars}
                heightClassName="h-[240px]"
                barSize={16}
                highlightMode="none"
                domain={[0, resolveUpperBound(durationBars.map((d) => d.score), 1)]}
                xAxisTickFormatter={formatMinutes}
                tooltipLabel="완료 시간"
                tooltipFormatter={formatDuration}
                emptyTitle="완료 시간 데이터가 없습니다"
                highlightedLabel={highlightedBand}
                onLabelClick={setHighlightedBand}
              />
            ) : (
              <LineTrendChart
                data={durationLineData}
                dataKey="label"
                valueKey="value"
                heightClassName="h-[240px]"
                domain={[0, resolveUpperBound(durationBars.map((d) => d.score), 1)]}
                yAxisTickFormatter={formatMinutes}
                tooltipLabel="완료 시간"
                tooltipFormatter={formatDuration}
                emptyTitle="완료 시간 데이터가 없습니다"
                highlightedLabel={highlightedBand}
                onLabelClick={setHighlightedBand}
              />
            )}
          </ChartCard>

          <ChartCard
            title="연령대별 평균 액션 수"
            badge={buildMaxBadge(
              ageStats.map((item) => ({ ageBand: item.ageBand, value: item.avgActions ?? 0 })),
              "가장 많음",
              formatActions
            )}
            controls={<ChartTypeSelect value={actionChartType} onChange={setActionChartType} />}
          >
            {actionChartType === "bar" ? (
              <HorizontalBarChart
                data={actionBars}
                heightClassName="h-[240px]"
                barSize={16}
                highlightMode="none"
                domain={[0, resolveUpperBound(actionBars.map((d) => d.score), 1)]}
                xAxisTickFormatter={formatActions}
                tooltipLabel="평균 액션 수"
                tooltipFormatter={formatActions}
                emptyTitle="액션 수 데이터가 없습니다"
                highlightedLabel={highlightedBand}
                onLabelClick={setHighlightedBand}
              />
            ) : (
              <LineTrendChart
                data={actionLineData}
                dataKey="label"
                valueKey="value"
                heightClassName="h-[240px]"
                domain={[0, resolveUpperBound(actionBars.map((d) => d.score), 1)]}
                yAxisTickFormatter={formatActions}
                tooltipLabel="평균 액션 수"
                tooltipFormatter={formatActions}
                emptyTitle="액션 수 데이터가 없습니다"
                highlightedLabel={highlightedBand}
                onLabelClick={setHighlightedBand}
              />
            )}
          </ChartCard>

          <ChartCard
            title="연령대별 탐색 포기율"
            badge={buildHighlightBadge(
              ageStats.map((item) => ({ ageBand: item.ageBand, value: item.avgDeclareFailure ?? 0 })),
              "max",
              "회"
            )}
            controls={<ChartTypeSelect value={declareChartType} onChange={setDeclareChartType} />}
          >
            {declareChartType === "line" ? (
              <LineTrendChart
                data={declareLineData}
                dataKey="label"
                valueKey="avgDeclareFailure"
                stroke="var(--color-primary-main)"
                domain={[0, resolveUpperBound(ageStats.map((item) => item.avgDeclareFailure ?? 0), 1)]}
                heightClassName="h-[240px]"
                yAxisTickFormatter={formatDeclareFailure}
                tooltipLabel="포기 횟수"
                tooltipFormatter={formatDeclareFailure}
                emptyTitle="탐색 포기율 데이터가 없습니다"
                highlightedLabel={highlightedBand}
                onLabelClick={setHighlightedBand}
              />
            ) : (
              <LollipopChart
                data={declareFailureBars}
                heightClassName="h-[240px]"
                barSize={16}
                xAxisTickFormatter={formatDeclareFailure}
                valueLabel="포기 횟수"
                valueFormatter={formatDeclareFailure}
                domain={[0, resolveUpperBound(declareFailureBars.map((d) => d.score), 1)]}
                emptyTitle="탐색 포기율 데이터가 없습니다"
                highlightedLabel={highlightedBand}
                onLabelClick={setHighlightedBand}
              />
            )}
          </ChartCard>
        </div>
      </section>
    </div>
  )
}

export default ResultOverviewPage
