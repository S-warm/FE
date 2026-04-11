import { AlertCircle, Clock, Flag, Users } from "lucide-react"

import { HorizontalBarChart } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"
import { progressData } from "@/mocks/data-visualization.mock"

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
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-card shadow-none",
        motion.card
      )}
    >
      <CardContent className="grid gap-3 px-5 py-4">
        <div className="flex items-center justify-between text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-surface-muted">{icon}</span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <button type="button" className="grid size-6 place-items-center rounded-lg" aria-label="도움말" title={description}>
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

function ResultOverviewPage() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard title="태스크 성공률" value="28%" description="successCount / totalAgents" icon={<Flag className="size-4" />} />
        <MetricCard title="테스트 AI 사용자" value="1,000명" description="총 에이전트 수" icon={<Users className="size-4" />} />
        <MetricCard title="평균 완료 시간" value="4.2분" description="성공한 에이전트 기준" icon={<Clock className="size-4" />} />
        <MetricCard title="이탈 에이전트" value="720명" description="totalAgents - successCount" icon={<AlertCircle className="size-4" />} />
      </section>

      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">전환 패널 성공률</p>
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="px-6 py-5">
            <HorizontalBarChart
              data={progressData.map((item) => ({ ...item, score: Math.min(100, item.score + 15) }))}
              barColor="var(--color-neutral-500)"
              emptyDescription="시뮬레이션을 시작하면 전환 패널 데이터가 표시됩니다."
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">연령대</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Card className={cn("group rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                랜딩 페이지
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="var(--color-chart-landing)"
                  data={[
                    { label: "10대", score: 95 },
                    { label: "20대", score: 72 },
                    { label: "30대", score: 55 },
                    { label: "40대", score: 22 },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn("group rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                폼 시작
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="var(--color-chart-form-start)"
                  data={[
                    { label: "10대", score: 98 },
                    { label: "20대", score: 74 },
                    { label: "30대", score: 52 },
                    { label: "40대", score: 20 },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn("group rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                필드 입력
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="var(--color-chart-field-input)"
                  data={[
                    { label: "10대", score: 99 },
                    { label: "20대", score: 76 },
                    { label: "30대", score: 55 },
                    { label: "40대", score: 24 },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={cn("group rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                유효성 검사
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="var(--color-chart-validation)"
                  data={[
                    { label: "10대", score: 96 },
                    { label: "20대", score: 73 },
                    { label: "30대", score: 54 },
                    { label: "40대", score: 23 },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default ResultOverviewPage
