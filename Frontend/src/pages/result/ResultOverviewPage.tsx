import { AlertCircle, Clock, Flag, Users } from "lucide-react"

import { HorizontalBarChart, LineTrendChart } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { ageOverviewData, type ProgressDatum } from "@/mocks/data-visualization.mock"

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
            <span className="grid size-6 place-items-center rounded-lg bg-surface-muted">{icon}</span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <button
            type="button"
            className="grid size-6 place-items-center rounded-lg"
            aria-label="도움말"
            title={description}
          >
            <AlertCircle className="size-4" />
          </button>
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
  key: "successRate" | "failureRate" | "declareFailure",
  highlightMode: "min" | "max",
  highlightColor: string,
  mutedColor: string
) {
  const scores = ageOverviewData.map((item) => item[key])
  const target = highlightMode === "min" ? Math.min(...scores) : Math.max(...scores)

  return ageOverviewData.map<ProgressDatum>((item) => ({
    label: item.label,
    score: item[key],
    color: item[key] === target ? highlightColor : mutedColor,
  }))
}

function formatMinutes(value: number) {
  return `${value.toFixed(1)}분`
}

function formatActions(value: number) {
  return `${value.toFixed(1)}회`
}

function ResultOverviewPage() {
  const successRateBars = buildMetricBars(
    "successRate",
    "min",
    "var(--color-chart-landing)",
    "var(--color-primary-100)"
  )
  const failureRateBars = buildMetricBars(
    "failureRate",
    "max",
    "var(--color-persona-fifty)",
    "var(--color-chart-failure-muted)"
  )
  const declareFailureBars = buildMetricBars(
    "declareFailure",
    "max",
    "var(--color-chart-validation)",
    "var(--color-chart-declare-muted)"
  )

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard
          title="태스크 성공률"
          value="28%"
          description="성공한 에이전트 수 / 총 에이전트 수"
          icon={<Flag className="size-4" />}
        />
        <MetricCard
          title="테스트 AI 사용자"
          value="1,000명"
          description="총 에이전트 수"
          icon={<Users className="size-4" />}
        />
        <MetricCard
          title="평균 완료 시간"
          value="4.2분"
          description="성공한 에이전트 기준"
          icon={<Clock className="size-4" />}
        />
        <MetricCard
          title="이탈 에이전트"
          value="720명"
          description="총 에이전트 수 - 성공한 에이전트 수"
          icon={<AlertCircle className="size-4" />}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard
          title="연령대별 성공률"
          badge="가장 낮음 40대 33%"
        >
          <HorizontalBarChart
            data={successRateBars}
            barColor="var(--color-chart-landing)"
            mutedBarColor="var(--color-primary-100)"
            highlightMode="min"
            heightClassName="h-[250px]"
          />
        </ChartCard>

        <ChartCard
          title="연령대별 평균 소요시간"
          badge="최장 40대 4.9분"
        >
          <LineTrendChart
            data={ageOverviewData}
            dataKey="label"
            valueKey="avgDurationMinutes"
            stroke="var(--color-persona-eighty)"
            domain={[0, 6]}
            heightClassName="h-[250px]"
            yAxisTickFormatter={formatMinutes}
            tooltipFormatter={formatMinutes}
          />
        </ChartCard>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartCard
          title="연령대별 실패율"
          badge="가장 높음 40대 58%"
        >
          <HorizontalBarChart
            data={failureRateBars}
            barColor="var(--color-persona-fifty)"
            mutedBarColor="var(--color-chart-failure-muted)"
            highlightMode="max"
            heightClassName="h-[220px]"
          />
        </ChartCard>

        <ChartCard
          title="연령대별 평균 액션 수"
          badge="최다 40대 11.7회"
        >
          <LineTrendChart
            data={ageOverviewData}
            dataKey="label"
            valueKey="avgActions"
            stroke="var(--color-chart-field-input)"
            domain={[0, 14]}
            heightClassName="h-[220px]"
            yAxisTickFormatter={formatActions}
            tooltipFormatter={formatActions}
          />
        </ChartCard>
      </section>

      <section className="grid gap-3">
        <ChartCard
          title="연령대별 declare_failure"
          badge="가장 높음 40대 29%"
        >
          <HorizontalBarChart
            data={declareFailureBars}
            barColor="var(--color-chart-validation)"
            mutedBarColor="var(--color-chart-declare-muted)"
            highlightMode="max"
            heightClassName="h-[240px]"
          />
        </ChartCard>
      </section>
    </div>
  )
}

export default ResultOverviewPage
