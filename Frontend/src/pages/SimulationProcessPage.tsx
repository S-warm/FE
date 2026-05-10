import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { CheckCircle2, Loader2 } from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { BrandingHeader } from "@/components/sections/auth/branding-header"
import { EmptyState } from "@/components/sections"
import { ErrorState } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { buildResultOverviewPath } from "@/constants/routes"
import { AuthLayout } from "@/layouts/AuthLayout"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useSimulationStatusQuery } from "@/queries"
import { useSimulationDraftStore } from "@/store/simulation-draft.store"

const steps = ["페이지 수집", "페르소나 생성", "시뮬레이션 실행", "결과 분석"] as const
const REDIRECT_DELAY_MS = 1200

interface SimulationProcessLocationState {
  simulationId: string
  title: string
  createdAt: string
  status?: string
}

function SimulationProcessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const draftProjectTitle = useSimulationDraftStore((state) => state.projectTitle)
  const startedAt = useSimulationDraftStore((state) => state.startedAt)
  const locationState = (location.state ?? null) as SimulationProcessLocationState | null
  const simulationId = locationState?.simulationId ?? ""
  const simulationTitle = locationState?.title ?? draftProjectTitle.trim()
  const simulationCreatedAt = locationState?.createdAt ?? startedAt ?? ""
  const hasProcessContext = Boolean(simulationId && simulationTitle && simulationCreatedAt)
  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch,
  } = useSimulationStatusQuery(simulationId, hasProcessContext)

  const activeStepIndex = statusData?.activeStepIndex ?? 0
  const progress = statusData?.progress ?? 0
  const isCompleted = statusData?.status === "completed"
  const isFailed = statusData?.status === "failed"

  useEffect(() => {
    if (!hasProcessContext || !isCompleted) {
      return
    }

    const handle = window.setTimeout(() => {
      navigate(buildResultOverviewPath(simulationId))
    }, REDIRECT_DELAY_MS)

    return () => window.clearTimeout(handle)
  }, [hasProcessContext, isCompleted, navigate, simulationId])

  return (
    <AuthLayout
      mainClassName="items-start justify-start overflow-hidden"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section className={cn("grid w-full gap-5 pt-2", motion.page)}>
        {!hasProcessContext ? (
          <EmptyState
            title="진행 중인 시뮬레이션 정보가 없습니다"
            description="시뮬레이션 생성 후 다시 진입해주세요."
            actionLabel="생성 화면으로 이동"
            onAction={() => navigate("/simulation/setup")}
          />
        ) : null}

        {hasProcessContext && isStatusError ? (
          <ErrorState
            title="시뮬레이션 상태를 불러오지 못했습니다"
            description="잠시 후 다시 시도해주세요."
            actionLabel="다시 시도"
            onAction={() => {
              void refetch()
            }}
            className="w-full max-w-[760px]"
          />
        ) : null}

        {hasProcessContext && isFailed ? (
          <ErrorState
            title="시뮬레이션 실행이 중단되었습니다"
            description={
              statusData?.message ??
              "시뮬레이션 상태가 실패로 종료되었습니다. 설정을 확인한 뒤 다시 시도해주세요."
            }
            actionLabel="다시 조회"
            onAction={() => {
              void refetch()
            }}
            className="w-full max-w-[760px]"
          />
        ) : null}

        {hasProcessContext && !isStatusError && !isFailed ? (
          <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
            <CardContent className="grid gap-4 px-6 py-5">
              <div className="grid gap-2 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="grid gap-1">
                  <p className="text-caption-12-regular text-muted-foreground">시뮬레이션</p>
                  <p className="text-body-16-medium text-foreground">{simulationTitle}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-caption-12-regular text-muted-foreground">생성일</p>
                  <p className="text-body-16-regular text-foreground">{simulationCreatedAt}</p>
                </div>
                <div className="flex items-center justify-end gap-2 rounded-xl border border-border-soft-2 bg-surface-hover-2 px-4 py-2">
                  <Loader2 className="size-4 animate-spin text-[var(--color-primary-main)]" />
                  <span className="text-body-14-medium text-text-secondary">
                    {isCompleted ? "결과 이동 준비 중" : isStatusLoading ? "상태 확인 중" : "시뮬레이션 진행 중"}
                  </span>
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
                    const isDone = index < activeStepIndex || (isCompleted && index === activeStepIndex)
                    const isActive = !isCompleted && index === activeStepIndex

                    return (
                      <div
                        key={step}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border border-border-soft bg-surface-hover-2 px-4 py-3",
                          motion.item,
                          isActive && "border-border-strong-hover bg-card",
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
                              isActive && "bg-[var(--color-primary-main)]",
                            )}
                            aria-hidden
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                <p className="text-caption-12-regular text-text-subtle">
                  상태 API polling 결과에 따라 단계와 진행률이 자동으로 갱신됩니다.
                </p>

                <div className="flex justify-end">
                  <CommonButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-subtle"
                    onClick={() => navigate(buildResultOverviewPath(simulationId))}
                  >
                    결과 화면으로 이동
                  </CommonButton>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </AuthLayout>
  )
}

export default SimulationProcessPage
