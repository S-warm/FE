import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ChevronDown } from "lucide-react"

import { DonutChart } from "@/components/charts"
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
import { useSimulationDraftStore } from "@/store/simulation-draft.store"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"

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
  teens: 72,
  twenties: 72,
  thirties: 72,
  forties: 71,
  fifties: 71,
  sixties: 71,
  seventies: 71,
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

  const [digitalLiteracy, setDigitalLiteracy] = useState<DigitalLiteracyLevel>("low")
  const [successCondition, setSuccessCondition] = useState("")
  const [projectTitleError, setProjectTitleError] = useState("")
  const [targetUrlError, setTargetUrlError] = useState("")
  const [endUrlError, setEndUrlError] = useState("")
  const [successConditionError, setSuccessConditionError] = useState("")
  const [ageRatioOpen, setAgeRatioOpen] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)
  const [ageGroupCounts, setAgeGroupCounts] = useState<AgeGroupCounts>(DEFAULT_AGE_GROUP_COUNTS)
  const navigate = useNavigate()

  const resetValidationErrors = () => {
    setProjectTitleError("")
    setTargetUrlError("")
    setEndUrlError("")
    setSuccessConditionError("")
  }

  const updateAgeGroupCount = (ageGroupKey: AgeGroupCountKey, rawValue: string) => {
    const numericValue = Number(rawValue.replaceAll(",", ""))
    const nextValue = Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : 0

    setAgeGroupCounts((prev) => ({
      ...prev,
      [ageGroupKey]: nextValue,
    }))
  }

  const resetAgeGroupCounts = () => {
    setAgeGroupCounts(DEFAULT_AGE_GROUP_COUNTS)
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
    Boolean(trimmedSuccessCondition)

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
          <section className="grid w-full max-w-[760px] gap-4">
            <div className="grid gap-3">
              <SetupSectionTitle title="프로젝트 제목" description="결과 리포트에 표시될 이름" />
              <TextField
                placeholder="예: A - Mall 구매 플로우"
                value={projectTitle}
                state={projectTitleError ? "error" : "default"}
                errorMessage={projectTitleError || undefined}
                onChange={(event) => {
                  setProjectTitle(event.target.value)
                  setProjectTitleError("")
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
                state={targetUrlError ? "error" : "default"}
                errorMessage={targetUrlError || undefined}
                onChange={(event) => {
                  setTargetUrl(event.target.value)
                  setTargetUrlError("")
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
                state={endUrlError ? "error" : "default"}
                errorMessage={endUrlError || undefined}
                onChange={(event) => {
                  setEndUrl(event.target.value)
                  setEndUrlError("")
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
              state={successConditionError ? "error" : "default"}
              errorMessage={successConditionError || undefined}
              onChange={(event) => {
                setSuccessCondition(event.target.value)
                setSuccessConditionError("")
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
                <SetupSectionTitle title="연령대별 페르소나 횟수" description="10대부터 70대까지 직접 입력" />
                <p className="text-caption-12-regular text-text-muted">{ageGroupSummary}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 items-center rounded-xl border border-border-soft bg-surface-subtle px-3 text-caption-12-medium text-text-secondary">
                  합계 {personaCount.toLocaleString()}회
                </span>
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
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="grid gap-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="rounded-xl bg-[var(--color-primary-50)] px-4 py-2 text-body-14-medium text-[var(--color-primary-main)]"
                          onClick={resetAgeGroupCounts}
                        >
                          기본값 복원
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {AGE_GROUP_CONFIG.map((ageGroup) => (
                          <Card
                            key={ageGroup.key}
                            className={cn("rounded-2xl border border-border-strong bg-card py-2 shadow-none", motion.card)}
                          >
                            <CardContent className="grid gap-3">
                              <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-subtitle-20-medium text-text-secondary">{ageGroup.label}</p>
                                  <span
                                    className="size-2.5 rounded-full"
                                    style={{ backgroundColor: ageGroup.color }}
                                    aria-hidden="true"
                                  />
                                </div>
                                <p className="mt-1 text-body-14-regular text-text-subtle">해당 연령대 페르소나 실행 횟수</p>
                              </div>
                              <TextField
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                value={String(ageGroupCounts[ageGroup.key])}
                                onChange={(event) => updateAgeGroupCount(ageGroup.key, event.target.value)}
                                variant="default"
                                size="lg"
                                className="h-11 rounded-xl border-border-soft-2 bg-card px-4 text-text-secondary"
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Card className={cn("rounded-2xl border border-border-strong bg-card py-3 shadow-none", motion.card)}>
                      <CardContent className="grid gap-4">
                        <p className="text-body-14-medium text-text-secondary-2">연령대별 비율</p>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            {ageDonutData.map((item) => (
                              <div key={item.name} className="flex items-center gap-2.5">
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                                <span className="text-caption-12-regular text-text-secondary">
                                  {item.name} {item.count.toLocaleString()}회 ({item.value.toFixed(1)}%)
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mx-auto mt-3 w-full max-w-[200px]">
                            <DonutChart data={ageDonutData} heightClassName="h-[208px]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid w-full max-w-[760px] gap-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-border-strong bg-card px-4 py-3 text-left transition-colors hover:bg-surface-hover-2"
              onClick={() => setAdvancedSettingsOpen((prev) => !prev)}
              aria-expanded={advancedSettingsOpen}
            >
              <div className="grid gap-1">
                <SetupSectionTitle title="고급 설정" description="추가 시뮬레이션 옵션" />
                <p className="text-caption-12-regular text-text-muted">
                  디지털 리터러시를 세부 조정할 수 있습니다.
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
                  <SetupSectionTitle title="디지털 리터러시" description="디지털 정보를 다루는 힘" />
                  <DigitalLiteracySelector
                    value={digitalLiteracy}
                    onChange={setDigitalLiteracy}
                    className="h-[68px]"
                  />
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
                  "flex h-[72px] w-full items-center justify-center px-4 text-subtitle-18-semibold transition-colors",
                  "rounded-b-2xl",
                  canStartSimulation
                    ? "bg-brand-subtle text-text-link hover:bg-brand-subtle-hover"
                    : "cursor-not-allowed bg-surface-muted text-text-muted"
                )}
                onClick={() => {
                  resetValidationErrors()
                  let hasError = false

                  if (!trimmedProjectTitle) {
                    setProjectTitleError("프로젝트 제목을 입력해주세요.")
                    hasError = true
                  }

                  if (!trimmedTargetUrl) {
                    setTargetUrlError("시작 URL을 입력해주세요.")
                    hasError = true
                  }

                  if (!trimmedEndUrl) {
                    setEndUrlError("종료 URL을 입력해주세요.")
                    hasError = true
                  }

                  if (!trimmedSuccessCondition) {
                    setSuccessConditionError("성공 조건을 입력해주세요.")
                    hasError = true
                  }

                  if (hasError) return

                  if (!startedAt) setStartedAt(new Date().toISOString())
                  navigate(routes.simulationProcess)
                }}
              >
                시뮬레이션 시작
              </button>
            </Card>
          </div>
        </div>
      </section>
    </AuthLayout>
  )
}

export default SimulationSetupPage
