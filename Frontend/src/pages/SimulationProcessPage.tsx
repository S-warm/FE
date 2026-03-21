import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { CheckCircle2, Loader2 } from "lucide-react"

import { BrandingHeader } from "@/components/sections/auth/branding-header"
import { Card, CardContent } from "@/components/ui/card"
import { AuthLayout } from "@/layouts/AuthLayout"
import { cn } from "@/lib/utils"
import { defaultSimulationId } from "@/mocks/simulation.mock"
import { buildResultOverviewPath } from "@/constants/routes"

const DUMMY_PROJECT = { title: "A - Mall 로그인 플로우", date: "2026-01-01" }

const steps = ["페이지 수집", "페르소나 생성", "시뮬레이션 실행", "결과 분석"] as const

function SimulationProcessPage() {
  const [tick, setTick] = useState(0)
  const maxTick = steps.length * 3 - 1
  const navigate = useNavigate()

  const activeStepIndex = useMemo(() => Math.min(steps.length - 1, Math.floor(tick / 3)), [tick])
  const progress = useMemo(() => Math.min(100, Math.round(((tick + 1) / (steps.length * 3)) * 100)), [tick])

  useEffect(() => {
    if (tick >= maxTick) return

    const handle = window.setInterval(() => {
      setTick((prev) => Math.min(maxTick, prev + 1))
    }, 900)
    return () => window.clearInterval(handle)
  }, [maxTick, tick])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      navigate(buildResultOverviewPath(defaultSimulationId))
    }, 3000)
    return () => window.clearTimeout(handle)
  }, [navigate])

  return (
    <AuthLayout
      mainClassName="items-start justify-start overflow-hidden"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section className="grid w-full gap-5 pt-2">
        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="grid gap-2 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="grid gap-1">
                <p className="text-caption-12-regular text-muted-foreground">시뮬레이션</p>
                <p className="text-body-16-medium text-foreground">{DUMMY_PROJECT.title}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-caption-12-regular text-muted-foreground">생성일</p>
                <p className="text-body-16-regular text-foreground">{DUMMY_PROJECT.date}</p>
              </div>
              <div className="flex items-center justify-end gap-2 rounded-xl border border-border-soft-2 bg-surface-hover-2 px-4 py-2">
                <Loader2 className="size-4 animate-spin text-[var(--color-primary-main)]" />
                <span className="text-body-14-medium text-text-secondary">시뮬레이션 진행 중</span>
              </div>
            </div>

            <div className="h-px bg-border-subtle" />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-body-14-medium text-text-body">진행률</p>
                  <span className="text-caption-12-medium text-text-muted">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary-main)] transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {steps.map((step, index) => {
                  const isDone = index < activeStepIndex
                  const isActive = index === activeStepIndex

                  return (
                    <div
                      key={step}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border border-border-soft bg-surface-hover-2 px-4 py-3",
                        isActive && "border-border-strong-hover bg-card"
                      )}
                    >
                      <div className="grid gap-0.5">
                        <p className="text-body-14-medium text-text-strong">{step}</p>
                        <p className="text-caption-12-regular text-text-subtle">
                          {isDone ? "완료" : isActive ? "진행 중" : "대기"}
                        </p>
                      </div>
                      {isDone ? (
                        <CheckCircle2 className="size-5 text-[var(--color-primary-main)]" />
                      ) : (
                        <div
                          className={cn(
                            "size-2.5 rounded-full bg-border-soft-3",
                            isActive && "bg-[var(--color-primary-main)]"
                          )}
                          aria-hidden
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="text-caption-12-regular text-text-subtle">
                결과 화면은 다음 단계에서 연결합니다. (현재는 과정 페이지 임시)
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </AuthLayout>
  )
}

export default SimulationProcessPage
