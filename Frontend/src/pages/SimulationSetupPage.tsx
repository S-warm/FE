import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ChevronDown, Loader2 } from "lucide-react"

import { DonutChart } from "@/components/charts"
import { RangeSlider, SelectionSelect } from "@/components/forms"
import { ErrorState, InlineError } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { BrandingHeader } from "@/components/sections/auth/branding-header"
import {
  DigitalLiteracySelector,
  type DigitalLiteracyLevel,
  SetupSectionTitle,
  SimulationSummaryCard,
} from "@/components/sections/simulation-setup"
import { TextArea, TextField } from "@/components/atoms"
import { AuthLayout } from "@/layouts/AuthLayout"
import routes from "@/constants/routes"
import { personaDeviceOptions, type PersonaDevice } from "@/constants/persona-device"
import { mapSimulationFormToCreateRequest } from "@/adapters"
import { useCreateSimulationMutation } from "@/queries"
import { ApiServiceError } from "@/services"
import { useSimulationDraftStore } from "@/store/simulation-draft.store"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"
import type { SimulationFormViewModel } from "@/types/view-model/simulation/simulation-form"
import {
  hasSimulationSetupValidationErrors,
  validateSimulationSetupForm,
  type SimulationSetupValidationErrors,
} from "@/validation/simulation-setup"
import { mapApiErrorToSimulationSetupErrors } from "@/validation/api-error-to-form"

const AGE_GROUP_CONFIG = [
  { key: "teens", label: "10대", color: "var(--color-persona-teen)" },
  { key: "twenties", label: "20대", color: "var(--color-primary-100)" },
  { key: "thirties", label: "30대", color: "var(--color-primary-200)" },
  { key: "forties", label: "40대", color: "var(--color-primary-300)" },
  { key: "fifties", label: "50대", color: "var(--color-persona-fifty)" },
  { key: "sixties", label: "60대", color: "var(--color-chart-form-start)" },
  { key: "seventies", label: "70대", color: "var(--color-persona-eighty)" },
] as const

type AgeGroupCountKey = (typeof AGE_GROUP_CONFIG)[number]["key"]
type AgeGroupCounts = Record<AgeGroupCountKey, number>

const DEFAULT_AGE_GROUP_COUNTS: AgeGroupCounts = {
  teens: 10,
  twenties: 10,
  thirties: 10,
  forties: 10,
  fifties: 10,
  sixties: 10,
  seventies: 10,
}

function SimulationSetupPage() {
  const targetUrl = useSimulationDraftStore((state) => state.targetUrl)
  const setTargetUrl = useSimulationDraftStore((state) => state.setTargetUrl)
  const endUrl = useSimulationDraftStore((state) => state.endUrl)
  const setEndUrl = useSimulationDraftStore((state) => state.setEndUrl)
  const projectTitle = useSimulationDraftStore((state) => state.projectTitle)
  const setProjectTitle = useSimulationDraftStore((state) => state.setProjectTitle)
  const startedAt = useSimulationDraftStore((state) => state.startedAt)
  const setStartedAt = useSimulationDraftStore((state) => state.setStartedAt)
  const personaDevice = useSimulationDraftStore((state) => state.personaDevice)
  const setPersonaDevice = useSimulationDraftStore((state) => state.setPersonaDevice)

  const [digitalLiteracy, setDigitalLiteracy] = useState<DigitalLiteracyLevel>("low")
  const [successCondition, setSuccessCondition] = useState("")
  const [errors, setErrors] = useState<SimulationSetupValidationErrors>({})
  const [ageRatioOpen, setAgeRatioOpen] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(true)
  const [ageGroupCounts, setAgeGroupCounts] = useState<AgeGroupCounts>(DEFAULT_AGE_GROUP_COUNTS)
  const [visionLoss, setVisionLoss] = useState(0)
  const [attentionLevel, setAttentionLevel] = useState(50)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  const createSimulationMutation = useCreateSimulationMutation()

  const resetValidationErrors = () => {
    setErrors({})
  }

  const formValues: SimulationFormViewModel = {
    projectTitle,
    targetUrl,
    endUrl,
    successCondition,
    digitalLiteracy,
    personaDevice,
    ageCounts: ageGroupCounts,
    visionImpairment: visionLoss,
    attentionLevel,
  }

  const updateAgeGroupCount = (ageGroupKey: AgeGroupCountKey, rawValue: string) => {
    const numericValue = Number(rawValue.replaceAll(",", ""))
    const nextValue = Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : 0

    setAgeGroupCounts((prev) => ({
      ...prev,
      [ageGroupKey]: nextValue,
    }))
  }

  const personaCount = useMemo(
    () => Object.values(ageGroupCounts).reduce((sum, count) => sum + count, 0),
    [ageGroupCounts]
  )

  const ageDonutData = useMemo(
    () =>
      AGE_GROUP_CONFIG.map((ageGroup) => ({
        name: ageGroup.label,
        value: personaCount > 0 ? Number(((ageGroupCounts[ageGroup.key] / personaCount) * 100).toFixed(1)) : 0,
        color: ageGroup.color,
        count: ageGroupCounts[ageGroup.key],
      })),
    [ageGroupCounts, personaCount]
  )

  const ageGroupSummary = useMemo(
    () =>
      AGE_GROUP_CONFIG.map((ageGroup) => `${ageGroup.label} ${ageGroupCounts[ageGroup.key].toLocaleString()}회`).join(" · "),
    [ageGroupCounts]
  )

  const trimmedProjectTitle = projectTitle.trim()
  const trimmedTargetUrl = targetUrl.trim()
  const trimmedEndUrl = endUrl.trim()
  const trimmedSuccessCondition = successCondition.trim()

  const canStartSimulation =
    Boolean(trimmedProjectTitle) &&
    Boolean(trimmedTargetUrl) &&
    Boolean(trimmedEndUrl) &&
    Boolean(trimmedSuccessCondition) &&
    !createSimulationMutation.isPending

  const handleStartSimulation = async () => {
    resetValidationErrors()
    setSubmitError(null)

    const nextErrors = validateSimulationSetupForm(formValues)
    setErrors(nextErrors)

    if (hasSimulationSetupValidationErrors(nextErrors)) return

    const startedAtValue = startedAt || new Date().toISOString()
    if (!startedAt) {
      setStartedAt(startedAtValue)
    }

    try {
      const requestBody = mapSimulationFormToCreateRequest(formValues)
      const response = await createSimulationMutation.mutateAsync(requestBody)

      navigate(routes.simulationProcess, {
        state: {
          simulationId: response.id,
          title: requestBody.title,
          createdAt: response.createdAt ?? startedAtValue,
          status: response.status,
        },
      })
    } catch (error) {
      if (error instanceof ApiServiceError) {
        const mappedErrors = mapApiErrorToSimulationSetupErrors(error)
        const { submitError: nextSubmitError, ...fieldErrors } = mappedErrors
        setErrors(fieldErrors)
        setSubmitError(nextSubmitError ?? null)
        return
      }

      const mappedErrors = mapApiErrorToSimulationSetupErrors(error)
      const { submitError: nextSubmitError, ...fieldErrors } = mappedErrors
      setErrors(fieldErrors)
      setSubmitError(nextSubmitError ?? null)
    }
  }

  return (
    <AuthLayout
      mainClassName="items-start justify-start overflow-hidden pb-8"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section
        className={cn(
          "grid w-full max-w-[1480px] items-start gap-8 pb-8 pt-2 xl:grid-cols-[minmax(0,740px)_420px]",
          motion.page
        )}
      >
        <div className="grid gap-4">
          {submitError ? (
            <ErrorState
              title="시뮬레이션을 시작하지 못했습니다"
              description={submitError}
              actionLabel="다시 시도"
              onAction={() => setSubmitError(null)}
              className="w-full max-w-[760px]"
            />
          ) : null}

          <section className="grid w-full max-w-[760px] gap-4">
            <div className="grid gap-3">
              <SetupSectionTitle title="프로젝트 제목" description="결과 리포트에 표시될 이름" />
              <TextField
                placeholder="예: A - Mall 구매 플로우"
                value={projectTitle}
                state={errors.projectTitle ? "error" : "default"}
                errorMessage={errors.projectTitle || undefined}
                onChange={(event) => {
                  setProjectTitle(event.target.value)
                  setErrors((prev) => ({ ...prev, projectTitle: undefined }))
                }}
                variant="default"
                size="lg"
                className="h-11 rounded-xl border-border-soft-2 bg-card px-4 text-text-secondary placeholder:text-text-muted"
              />
            </div>
          </section>

          <section className="grid w-full max-w-[760px] gap-4 md:grid-cols-2">
            <div className="grid gap-3">
              <SetupSectionTitle title="타겟 URL" description="시뮬레이션이 시작되는 페이지" />
              <TextField
                placeholder="시작 URL 링크를 입력하세요."
                value={targetUrl}
                state={errors.targetUrl ? "error" : "default"}
                errorMessage={errors.targetUrl || undefined}
                onChange={(event) => {
                  setTargetUrl(event.target.value)
                  setErrors((prev) => ({ ...prev, targetUrl: undefined }))
                }}
                variant="default"
                size="lg"
                className="h-11 rounded-xl border-border-soft-2 bg-card px-4 text-text-secondary placeholder:text-text-muted"
              />
            </div>
            <div className="grid gap-3">
              <SetupSectionTitle title="종료 URL" description="시뮬레이션이 도달해야 하는 페이지" />
              <TextField
                placeholder="종료 URL 링크를 입력하세요."
                value={endUrl}
                state={errors.endUrl ? "error" : "default"}
                errorMessage={errors.endUrl || undefined}
                onChange={(event) => {
                  setEndUrl(event.target.value)
                  setErrors((prev) => ({ ...prev, endUrl: undefined }))
                }}
                variant="default"
                size="lg"
                className="h-11 rounded-xl border-border-soft-2 bg-card px-4 text-text-secondary placeholder:text-text-muted"
              />
            </div>
          </section>

          <section className="grid w-full max-w-[760px] gap-3">
            <SetupSectionTitle title="성공 조건" description="페르소나의 최종 도착지를 지정" />
            <TextArea
              placeholder="예: 로그인 완료 후 /mypage 진입"
              value={successCondition}
              state={errors.successCondition ? "error" : "default"}
              errorMessage={errors.successCondition || undefined}
              onChange={(event) => {
                setSuccessCondition(event.target.value)
                setErrors((prev) => ({ ...prev, successCondition: undefined }))
              }}
              variant="default"
              size="md"
              className="h-[88px] resize-none overflow-y-auto overscroll-contain rounded-2xl border-border-soft-2 bg-card px-4 py-3 text-text-secondary placeholder:text-text-muted"
            />
          </section>

          <section className="grid w-full max-w-[760px] gap-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-border-strong bg-card px-4 py-3 text-left transition-colors hover:bg-surface-hover-2"
              onClick={() => setAgeRatioOpen((prev) => !prev)}
              aria-expanded={ageRatioOpen}
            >
              <div className="grid gap-1">
                <SetupSectionTitle title="연령대별 페르소나 횟수" description="연령대별 실행 수를 직접 조정합니다." />
                <p className="text-caption-12-regular text-text-muted">총합은 시뮬레이션 요약에서 확인할 수 있습니다.</p>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("size-4 text-text-muted transition-transform", ageRatioOpen && "rotate-180")} />
              </div>
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                ageRatioOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pt-1 pb-3">
                  <div className="grid gap-4 xl:grid-cols-2 xl:items-stretch">
                    <Card className={cn("h-full rounded-2xl border border-border-strong bg-card py-3 shadow-none", motion.card)}>
                      <CardContent className="grid h-full gap-3">
                        {AGE_GROUP_CONFIG.map((ageGroup) => (
                          (() => {
                            const count = ageGroupCounts[ageGroup.key]
                            const percent = personaCount > 0 ? (count / personaCount) * 100 : 0
                            const isEmpty = count === 0

                            return (
                          <div
                            key={ageGroup.key}
                            className={cn(
                              "grid gap-2.5 rounded-2xl border px-4 py-2.5 transition-colors md:grid-cols-[minmax(0,1fr)_88px] md:items-center",
                              isEmpty
                                ? "border-border-subtle bg-surface-subtle/70"
                                : "border-border-soft bg-surface-subtle"
                            )}
                          >
                            <div className="grid gap-2 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn("size-2.5 rounded-full", isEmpty && "opacity-45")}
                                  style={{ backgroundColor: ageGroup.color }}
                                  aria-hidden="true"
                                />
                                <p className={cn("text-subtitle-18-semibold", isEmpty ? "text-text-subtle" : "text-text-secondary")}>
                                  {ageGroup.label}
                                </p>
                              </div>

                              <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_52px]">
                                <div className="h-1.5 w-full min-w-0 overflow-hidden rounded-full bg-border-subtle">
                                  <div
                                    className={cn("h-full rounded-full transition-[width,opacity] duration-300", isEmpty && "opacity-35")}
                                    style={{
                                      width: `${percent}%`,
                                      backgroundColor: ageGroup.color,
                                    }}
                                  />
                                </div>
                                <span className="sr-only">{percent.toFixed(1)}%</span>
                              </div>
                            </div>

                            <div className="relative md:justify-self-end md:w-[88px]">
                              <TextField
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                value={String(ageGroupCounts[ageGroup.key])}
                                onChange={(event) => updateAgeGroupCount(ageGroup.key, event.target.value)}
                                variant="default"
                                size="md"
                                className={cn(
                                  "h-9 rounded-lg bg-card px-2.5 pr-7 text-right text-body-14-medium tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0",
                                  isEmpty
                                    ? "border-border-subtle text-text-subtle"
                                    : "border-border-soft-2 text-text-secondary"
                                )}
                              />
                              <span className={cn("pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-caption-12-medium", isEmpty ? "text-text-subtle" : "text-text-muted")}>
                                회
                              </span>
                            </div>
                          </div>
                            )
                          })()
                        ))}
                      </CardContent>
                    </Card>

                    <Card className={cn("h-full rounded-2xl border border-border-strong bg-card py-3 shadow-none", motion.card)}>
                      <CardContent className="grid gap-5">
                        <div className="flex items-end justify-between gap-3">
                          <p className="text-body-14-medium text-text-secondary-2">연령대별 비율</p>
                          <p className="text-caption-12-medium text-text-muted">
                            총 페르소나 {personaCount.toLocaleString()}회
                          </p>
                        </div>
                        <div className="grid gap-3">
                          {ageDonutData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2.5">
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                                aria-hidden
                              />
                              <span className="text-caption-12-medium text-text-muted">
                                {item.name} · {item.count.toLocaleString()}회 · {item.value.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mx-auto w-full max-w-[220px]">
                          <DonutChart data={ageDonutData} heightClassName="h-[220px]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
            <InlineError message={errors.ageCounts} />
          </section>

          <section className="grid w-full max-w-[760px] gap-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-border-strong bg-card px-4 py-3 text-left transition-colors hover:bg-surface-hover-2"
              onClick={() => setAdvancedSettingsOpen((prev) => !prev)}
              aria-expanded={advancedSettingsOpen}
            >
              <div className="grid gap-1">
                <SetupSectionTitle title="고급 설정" description="디지털 리터러시와 세부 조건을 함께 조정합니다." />
                <p className="text-caption-12-regular text-text-muted">
                  리터러시, 시력 저하, 주의력, 디바이스를 한 번에 설정할 수 있습니다.
                </p>
              </div>
              <ChevronDown
                className={cn("size-4 text-text-muted transition-transform", advancedSettingsOpen && "rotate-180")}
              />
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                advancedSettingsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid gap-4 pt-1 pb-3">
                  <div className="grid gap-3">
                    <SetupSectionTitle title="디지털 리터러시" description="디지털 정보를 다루는 힘" />
                    <DigitalLiteracySelector
                      value={digitalLiteracy}
                      onChange={(nextValue) => {
                        setDigitalLiteracy(nextValue)
                        setErrors((prev) => ({ ...prev, digitalLiteracy: undefined }))
                      }}
                      className="h-[56px]"
                      showDetailTrigger={false}
                    />
                    <InlineError message={errors.digitalLiteracy} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className="rounded-2xl border border-border-strong bg-card py-0 shadow-none">
                      <CardContent className="grid gap-4 p-4">
                        <div className="grid gap-1">
                          <p className="text-body-14-medium text-text-secondary">시력 저하</p>
                          <p className="text-caption-12-regular text-text-muted">시각 정보 인지 난이도를 조절합니다.</p>
                        </div>
                        <RangeSlider
                          value={visionLoss}
                          min={0}
                          max={100}
                          step={1}
                          unit="%"
                          color="var(--color-border-soft-3)"
                          tooltipFormatter={(nextValue) => `${nextValue}%`}
                          onChange={(nextValue) => {
                            setVisionLoss(nextValue)
                            setErrors((prev) => ({ ...prev, visionImpairment: undefined }))
                          }}
                        />
                        <InlineError message={errors.visionImpairment} />
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border-strong bg-card py-0 shadow-none">
                      <CardContent className="grid gap-4 p-4">
                        <div className="grid gap-1">
                          <p className="text-body-14-medium text-text-secondary">주의력</p>
                          <p className="text-caption-12-regular text-text-muted">탐색 집중도와 이탈 성향을 가정합니다.</p>
                        </div>
                        <RangeSlider
                          value={attentionLevel}
                          min={0}
                          max={100}
                          step={1}
                          color="var(--color-brand-accent)"
                          startLabel="낮음"
                          endLabel="높음"
                          tooltipFormatter={(nextValue) => `${nextValue}%`}
                          onChange={(nextValue) => {
                            setAttentionLevel(nextValue)
                            setErrors((prev) => ({ ...prev, attentionLevel: undefined }))
                          }}
                        />
                        <InlineError message={errors.attentionLevel} />
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl border border-border-strong bg-card py-0 shadow-none">
                    <CardContent className="grid gap-4 p-4">
                      <div className="grid gap-1">
                        <p className="text-body-14-medium text-text-secondary">디바이스</p>
                        <p className="text-caption-12-regular text-text-muted">페르소나가 사용하는 기본 환경을 선택합니다.</p>
                      </div>
                      <SelectionSelect
                        value={personaDevice}
                        options={[...personaDeviceOptions]}
                        state={errors.personaDevice ? "error" : "default"}
                        onChange={(nextDevice) => {
                          setPersonaDevice(nextDevice as PersonaDevice)
                          setErrors((prev) => ({ ...prev, personaDevice: undefined }))
                        }}
                      />
                      <InlineError message={errors.personaDevice} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex self-stretch flex-col gap-5 pt-px xl:sticky xl:top-6">
          <SetupSectionTitle title="시뮬레이션 요약" />
          <div className="grid gap-0">
            <SimulationSummaryCard
              projectTitle={projectTitle}
              targetUrl={targetUrl}
              endUrl={endUrl}
              personaCount={personaCount}
              ageGroupSummary={ageGroupSummary}
              personaDevice={personaDevice}
              digitalLiteracy={digitalLiteracy}
              successCondition={successCondition}
              className="rounded-2xl rounded-b-none border-b-0"
            />
            <Card className="rounded-2xl rounded-t-none border border-border-strong bg-surface-subtle py-0 shadow-none ring-0">
              <button
                type="button"
                disabled={!canStartSimulation}
                className={cn(
                  "flex h-[72px] w-full items-center justify-center gap-2 px-4 text-subtitle-18-semibold transition-colors",
                  "rounded-b-2xl",
                  canStartSimulation
                    ? "bg-brand-subtle text-text-link hover:bg-brand-subtle-hover"
                    : "cursor-not-allowed bg-surface-muted text-text-muted"
                )}
                onClick={() => {
                  void handleStartSimulation()
                }}
              >
                {createSimulationMutation.isPending ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    시뮬레이션 생성 중
                  </>
                ) : (
                  "시뮬레이션 시작"
                )}
              </button>
            </Card>
          </div>
        </div>
      </section>
    </AuthLayout>
  )
}

export default SimulationSetupPage
