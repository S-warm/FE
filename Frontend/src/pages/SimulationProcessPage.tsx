import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { EmptyState } from "@/components/sections"
import { BrandingHeader } from "@/components/sections/auth/branding-header"
import { ErrorState } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { buildResultOverviewPath } from "@/constants/routes"
import { AuthLayout } from "@/layouts/AuthLayout"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useSimulationStatusQuery } from "@/queries"
import { resultOverviewService } from "@/services"
import { ApiServiceError } from "@/services/core/api-service-error"
import { useSimulationDraftStore } from "@/store/simulation-draft.store"

const steps = ["페이지 수집", "페르소나 생성", "시뮬레이션 실행", "결과 분석"] as const
const REDIRECT_DELAY_MS = 1200
const OVERVIEW_READY_RETRY_DELAY_MS = 1500
const OVERVIEW_READY_MAX_ATTEMPTS = 8
const TERMINAL_STATUSES = new Set(["completed", "failed", "error", "cancelled"])

interface SimulationProcessLocationState {
  simulationId: string
  title: string
  createdAt: string
  status?: string
}

function resolveStatusLabel(status: string, isLoading: boolean) {
  if (isLoading) {
    return "상태 확인 중"
  }

  if (status === "failed" || status === "error" || status === "cancelled") {
    return "시뮬레이션 실패"
  }

  if (status === "completed") {
    return "시뮬레이션 완료"
  }

  return "시뮬레이션 진행 중"
}

function resolveActiveStepIndex(status: string, currentStep?: string) {
  const resolvedIndex = currentStep ? steps.findIndex((step) => step === currentStep) : -1

  if (resolvedIndex >= 0) {
    return resolvedIndex
  }

  if (status === "queued" || status === "pending" || status === "collecting_pages") {
    return 0
  }

  if (status === "generating_personas") {
    return 1
  }

  if (status === "running" || status === "in_progress") {
    return 2
  }

  return 3
}

function resolveCurrentStepDescription(
  status: string,
  currentStep?: string,
  completed?: number,
  total?: number,
  failed?: number
) {
  if (currentStep) {
    if (typeof completed === "number" && typeof total === "number" && total > 0) {
      const failedCount = typeof failed === "number" ? failed : 0
      return `${currentStep} (${completed}/${total}, 실패 ${failedCount})`
    }

    return currentStep
  }

  if (status === "failed" || status === "error" || status === "cancelled") {
    return "백엔드 처리 중 오류가 발생했습니다. 서버 로그를 확인한 뒤 다시 시도해주세요."
  }

  if (status === "completed") {
    return "결과 데이터 생성이 완료되었습니다."
  }

  return "시뮬레이션 상태를 확인하고 있습니다."
}

interface ProcessCardProps {
  simulationId: string
  simulationTitle: string
  simulationCreatedAt: string
}

function ProcessCard({
  simulationId,
  simulationTitle,
  simulationCreatedAt,
}: ProcessCardProps) {
  const navigate = useNavigate()
  const {
    data: simulationStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useSimulationStatusQuery(simulationId)

  const normalizedStatus = String(simulationStatus?.status ?? "").toLowerCase()
  const isTerminalStatus = TERMINAL_STATUSES.has(normalizedStatus)
  const isFailedStatus =
    normalizedStatus === "failed" ||
    normalizedStatus === "error" ||
    normalizedStatus === "cancelled"

  const activeStepIndex = resolveActiveStepIndex(
    normalizedStatus,
    simulationStatus?.currentStep
  )

  const progress = (() => {
    if (typeof simulationStatus?.progress === "number") {
      return Math.max(0, Math.min(100, Math.round(simulationStatus.progress)))
    }

    const fallbackByStep = [15, 35, 70, isFailedStatus ? 100 : 92]
    return fallbackByStep[activeStepIndex] ?? 15
  })()

  const statusLabel = resolveStatusLabel(normalizedStatus, isStatusLoading)
  const currentStepDescription = resolveCurrentStepDescription(
    normalizedStatus,
    simulationStatus?.currentStep,
    simulationStatus?.completed,
    simulationStatus?.total,
    simulationStatus?.failed
  )

  useEffect(() => {
    if (!isTerminalStatus || isFailedStatus) {
      return
    }

    let isCancelled = false

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms)
      })

    const navigateWhenOverviewReady = async () => {
      await delay(REDIRECT_DELAY_MS)

      for (let attempt = 0; attempt < OVERVIEW_READY_MAX_ATTEMPTS; attempt += 1) {
        if (isCancelled) {
          return
        }

        try {
          await resultOverviewService.getOverview(simulationId)
          navigate(buildResultOverviewPath(simulationId))
          return
        } catch (error) {
          if (!(error instanceof ApiServiceError) || error.status !== 404) {
            navigate(buildResultOverviewPath(simulationId))
            return
          }
        }

        if (attempt < OVERVIEW_READY_MAX_ATTEMPTS - 1) {
          await delay(OVERVIEW_READY_RETRY_DELAY_MS)
        }
      }

      if (!isCancelled) {
        navigate(buildResultOverviewPath(simulationId))
      }
    }

    void navigateWhenOverviewReady()

    return () => {
      isCancelled = true
    }
  }, [isFailedStatus, isTerminalStatus, navigate, simulationId])

  if (isStatusError) {
    return (
      <ErrorState
        title="진행 상태를 불러오지 못했습니다"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 시도"
        onAction={() => {
          void refetchStatus()
        }}
      />
    )
  }

  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-4 px-6 py-5">
        <div className="grid gap-2 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="grid gap-1">
            <p className="text-caption-12-regular text-foreground">시뮬레이션</p>
            <p className="text-body-16-medium text-foreground">{simulationTitle}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-caption-12-regular text-foreground">생성일</p>
            <p className="text-body-16-regular text-foreground">{simulationCreatedAt}</p>
          </div>
          <div
            className={cn(
              "flex items-center justify-end gap-2 rounded-xl border px-4 py-2",
              isFailedStatus
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-border-soft-2 bg-surface-hover-2"
            )}
          >
            {isFailedStatus ? (
              <AlertTriangle className="size-4" />
            ) : isTerminalStatus ? (
              <CheckCircle2 className="size-4 text-[var(--color-primary-main)]" />
            ) : (
              <Loader2 className="size-4 animate-spin text-[var(--color-primary-main)]" />
            )}
            <span className="text-body-14-medium">{statusLabel}</span>
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

          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-body-14-regular",
              isFailedStatus
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-border-soft bg-surface-subtle text-text-secondary"
            )}
          >
            {currentStepDescription}
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
                    motion.item,
                    isActive && "border-border-strong-hover bg-card"
                  )}
                >
                  <div className="grid gap-0.5">
                    <p className="text-body-14-medium text-text-strong">{step}</p>
                    <p className="text-caption-12-regular text-text-subtle">
                      {isDone ? "완료" : isActive ? (isFailedStatus ? "중단" : "진행 중") : "대기"}
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
            {simulationStatus?.updatedAt
              ? `마지막 상태 갱신: ${simulationStatus.updatedAt}`
              : "1.5초 간격으로 상태를 확인하고 있습니다."}
          </p>

          <div className="flex justify-end gap-2">
            <CommonButton
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-subtle"
              onClick={() => navigate(buildResultOverviewPath(simulationId))}
            >
              바로 결과 보기
            </CommonButton>

            {normalizedStatus === "completed" ? (
              <CommonButton
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-subtle"
                onClick={() => navigate(buildResultOverviewPath(simulationId))}
              >
                결과 화면으로 이동
              </CommonButton>
            ) : (
              <CommonButton
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-subtle"
                onClick={() => navigate("/simulation/setup")}
              >
                설정 화면으로 이동
              </CommonButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
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

  return (
    <AuthLayout
      mainClassName="items-start justify-start overflow-hidden"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section className={cn("grid w-full gap-5 pt-2", motion.page)}>
        {!hasProcessContext ? (
          <EmptyState
            title="진행 중인 시뮬레이션 정보가 없습니다"
            description="시뮬레이션 생성 화면에서 다시 시작해주세요."
            actionLabel="생성 화면으로 이동"
            onAction={() => navigate("/simulation/setup")}
          />
        ) : null}

        {hasProcessContext ? (
          <ProcessCard
            simulationId={simulationId}
            simulationTitle={simulationTitle}
            simulationCreatedAt={simulationCreatedAt}
          />
        ) : null}
      </section>
    </AuthLayout>
  )
}

export default SimulationProcessPage
