import { AlertCircle, Clock, Flag, Users } from "lucide-react"

import { HorizontalBarChart } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="rounded-2xl border border-border-strong bg-card shadow-none transition-colors hover:border-border-strong-hover">
      <CardContent className="grid gap-3 px-5 py-4">
        <div className="flex items-center justify-between text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-surface-muted">{icon}</span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <button type="button" className="grid size-6 place-items-center rounded-lg hover:bg-surface-hover" aria-label="도움말">
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
        <MetricCard title="전환률" value="28%" description="업계 평균 이하 (45%)" icon={<Flag className="size-4" />} />
        <MetricCard title="테스트 된 AI 사용자" value="1,000" description="모든 페르소나 포함" icon={<Users className="size-4" />} />
        <MetricCard title="평균 완료 시간" value="4.2분" description="목표: 2~3분" icon={<Clock className="size-4" />} />
        <MetricCard title="성공 이벤트" value="280" description="목표 도달 이벤트" icon={<Flag className="size-4" />} />
      </section>

      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">전환 패널 성공률</p>
        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="px-6 py-5">
            <HorizontalBarChart
              data={progressData.map((item) => ({ ...item, score: Math.min(100, item.score + 15) }))}
              barColor="#9b9b9b"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">연령대</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="group rounded-2xl border border-border-strong bg-card shadow-none">
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                랜딩 페이지
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="#4669d0"
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

          <Card className="group rounded-2xl border border-border-strong bg-card shadow-none">
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                폼 시작
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="#7edfe6"
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

          <Card className="group rounded-2xl border border-border-strong bg-card shadow-none">
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                필드 입력
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="#6a36d9"
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

          <Card className="group rounded-2xl border border-border-strong bg-card shadow-none">
            <CardContent className="px-6 py-5">
              <p className="text-body-14-medium text-text-body transition-colors group-hover:text-text-strong">
                유효성 검사
              </p>
              <div className="mt-3">
                <HorizontalBarChart
                  heightClassName="h-[220px]"
                  barColor="#3182f6"
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
