import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { DonutChart } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BrandingHeader } from "@/components/sections/auth/branding-header"
import {
  DigitalLiteracySelector,
  PersonaRangeSlider,
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
import { formatRelativeTime } from "@/utils/format-relative-time"

function AgeRatioInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-2 self-center md:self-auto">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={String(value)}
        aria-label="연령 비율 입력"
        className="h-10 w-18 rounded-xl border-border-soft-2 bg-card px-3 text-center text-body-14-medium text-text-secondary"
        onChange={(event) => {
          const digitsOnly = event.target.value.replace(/\D/g, "")
          onChange(digitsOnly ? Number(digitsOnly) : 0)
        }}
      />
      <span className="text-body-14-medium text-text-subtle">%</span>
    </div>
  )
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

  const [personaCount, setPersonaCount] = useState(500)
  const [digitalLiteracy, setDigitalLiteracy] = useState<DigitalLiteracyLevel>("low")
  const [successCondition, setSuccessCondition] = useState("")
  const [ageRatios, setAgeRatios] = useState({
    teen: 25,
    fifty: 25,
    eighty: 50,
  })
  const [displayAgeRatios, setDisplayAgeRatios] = useState(ageRatios)
  const animationFrameRef = useRef<number | null>(null)
  const displayAgeRatiosRef = useRef(displayAgeRatios)
  const navigate = useNavigate()

  useEffect(() => {
    displayAgeRatiosRef.current = displayAgeRatios
  }, [displayAgeRatios])

  const redistributeAgeRatio = (changedKey: keyof typeof ageRatios, nextValue: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(nextValue)))
    const otherKeys = (Object.keys(ageRatios) as Array<keyof typeof ageRatios>).filter(
      (key) => key !== changedKey
    )
    const remaining = 100 - clamped

    const nextState = { ...ageRatios, [changedKey]: clamped }

    if (remaining <= 0) {
      otherKeys.forEach((key) => {
        nextState[key] = 0
      })
      setAgeRatios(nextState)
      return
    }

    const weights = otherKeys.map((key) => ageRatios[key])
    const weightTotal = weights.reduce((sum, value) => sum + value, 0)

    if (weightTotal <= 0) {
      const split = Math.floor(remaining / otherKeys.length)
      const rest = remaining - split * otherKeys.length
      otherKeys.forEach((key, index) => {
        nextState[key] = split + (index < rest ? 1 : 0)
      })
      setAgeRatios(nextState)
      return
    }

    const raw = weights.map((weight) => (weight / weightTotal) * remaining)
    const floors = raw.map((value) => Math.floor(value))
    const allocated = floors.reduce((sum, value) => sum + value, 0)
    const leftover = remaining - allocated

    const order = raw
      .map((value, index) => ({ index, frac: value - floors[index] }))
      .sort((a, b) => b.frac - a.frac)

    for (let i = 0; i < leftover; i += 1) {
      const target = order[i % order.length]?.index
      if (target === undefined) break
      floors[target] += 1
    }

    otherKeys.forEach((key, index) => {
      nextState[key] = floors[index]
    })
    setAgeRatios(nextState)
  }

  useEffect(() => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current)
    }

    const start = performance.now()
    const from = displayAgeRatiosRef.current
    const to = ageRatios
    const duration = 300

    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = easeOutCubic(progress)

      setDisplayAgeRatios({
        teen: from.teen + (to.teen - from.teen) * eased,
        fifty: from.fifty + (to.fifty - from.fifty) * eased,
        eighty: from.eighty + (to.eighty - from.eighty) * eased,
      })

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(tick)
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [ageRatios])

  const ageDonutData = useMemo(
    () => [
      { name: "10대", value: displayAgeRatios.teen, color: "var(--color-persona-teen)" },
      { name: "50대", value: displayAgeRatios.fifty, color: "var(--color-persona-fifty)" },
      { name: "80대", value: displayAgeRatios.eighty, color: "var(--color-persona-eighty)" },
    ],
    [displayAgeRatios]
  )

  return (
    <AuthLayout
      mainClassName="items-start justify-start overflow-hidden pb-0"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section
        className={cn(
          "grid w-full max-w-[1560px] gap-16 pb-0 pt-2 sm:grid-cols-[760px_400px]",
          motion.page
        )}
      >
        <div className="grid gap-5">
          <section className="grid w-full max-w-[760px] gap-4">
            <div className="grid gap-3">
              <SetupSectionTitle title="프로젝트 제목" description="결과 리포트에 표시될 이름" />
              <TextField
                placeholder="예: A - Mall 구매 플로우"
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
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
                onChange={(event) => setTargetUrl(event.target.value)}
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
                onChange={(event) => setEndUrl(event.target.value)}
                variant="default"
                size="lg"
                className="h-11 rounded-xl border-border-soft-2 bg-card px-4 text-text-secondary placeholder:text-text-muted"
              />
            </div>
          </section>

          <section className="grid w-full max-w-[760px] gap-4 md:grid-cols-[minmax(0,1.50fr)_minmax(0,0.70fr)]">
            <div className="grid gap-3">
              <SetupSectionTitle
                title="페르소나 횟수"
                description="테스트에 사용할 시뮬레이션별 페르소나 양"
              />
              <Card className={cn("h-[68px] rounded-2xl border border-border-strong bg-card py-2 shadow-none", motion.card)}>
                <CardContent className="pt-0.5">
                  <PersonaRangeSlider value={personaCount} onChange={setPersonaCount} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3">
              <SetupSectionTitle title="디지털 리터러시" description="디지털 정보를 다루는 힘" />
              <DigitalLiteracySelector
                value={digitalLiteracy}
                onChange={setDigitalLiteracy}
                className="h-[68px]"
              />
            </div>
          </section>

          <section className="grid w-full max-w-[760px] gap-4 md:grid-cols-[518px_minmax(0,1fr)]">
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <SetupSectionTitle title="연령별 투입 비율" description="페르소나 연령대 비율" />
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex h-9 items-center rounded-xl border px-3 text-body-14-medium",
                      ageRatios.teen + ageRatios.fifty + ageRatios.eighty === 100
                        ? "border-border-soft bg-surface-subtle text-text-secondary"
                        : "border-critical-accent/40 bg-danger-surface text-critical-text",
                    ].join(" ")}
                  >
                    합계 {ageRatios.teen + ageRatios.fifty + ageRatios.eighty}%
                  </span>
                  <button
                    type="button"
                    className="rounded-xl bg-[var(--color-primary-50)] px-4 py-2 text-body-14-medium text-[var(--color-primary-main)]"
                    onClick={() =>
                      setAgeRatios({
                        teen: 34,
                        fifty: 33,
                        eighty: 33,
                      })
                    }
                  >
                    균등배치
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <Card className={cn("rounded-2xl border border-border-strong bg-card py-2 shadow-none", motion.card)}>
                  <CardContent className="grid gap-3 md:grid-cols-[148px_minmax(0,1fr)_80px] md:items-center">
                    <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                      <p className="text-subtitle-20-medium text-[var(--color-primary-600)]">10대~30대</p>
                      <p className="mt-1 text-body-14-regular text-text-subtle">
                        트렌드에 민감한
                        <br />
                        알파 세대
                      </p>
                    </div>
                    <PersonaRangeSlider
                      value={ageRatios.teen}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      color="var(--color-persona-teen)"
                      tooltipFormatter={(value) => `${value}%`}
                      onChange={(value) => redistributeAgeRatio("teen", value)}
                    />
                    <AgeRatioInput value={ageRatios.teen} onChange={(value) => redistributeAgeRatio("teen", value)} />
                  </CardContent>
                </Card>

                <Card className={cn("rounded-2xl border border-border-strong bg-card py-2 shadow-none", motion.card)}>
                  <CardContent className="grid gap-3 md:grid-cols-[148px_minmax(0,1fr)_80px] md:items-center">
                    <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                      <p className="text-subtitle-20-medium text-[var(--color-primary-600)]">40대~50대</p>
                      <p className="mt-1 text-body-14-regular text-text-subtle">안정성과 신뢰를 중시하는 중장년층</p>
                    </div>
                    <PersonaRangeSlider
                      value={ageRatios.fifty}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      color="var(--color-persona-fifty)"
                      tooltipFormatter={(value) => `${value}%`}
                      onChange={(value) => redistributeAgeRatio("fifty", value)}
                    />
                    <AgeRatioInput value={ageRatios.fifty} onChange={(value) => redistributeAgeRatio("fifty", value)} />
                  </CardContent>
                </Card>

                <Card className={cn("rounded-2xl border border-border-strong bg-card py-2 shadow-none", motion.card)}>
                  <CardContent className="grid gap-3 md:grid-cols-[148px_minmax(0,1fr)_80px] md:items-center">
                    <div className="rounded-xl bg-surface-muted px-3 py-2.5">
                      <p className="text-subtitle-20-medium text-[var(--color-primary-600)]">60대~80대</p>
                      <p className="mt-1 text-body-14-regular text-text-subtle">
                        접근성 개선이 필요한
                        <br />
                        디지털 소외계층
                      </p>
                    </div>
                    <PersonaRangeSlider
                      value={ageRatios.eighty}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      color="var(--color-persona-eighty)"
                      tooltipFormatter={(value) => `${value}%`}
                      onChange={(value) => redistributeAgeRatio("eighty", value)}
                    />
                    <AgeRatioInput value={ageRatios.eighty} onChange={(value) => redistributeAgeRatio("eighty", value)} />
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className={cn("mt-[16px] self-end rounded-2xl border border-border-strong bg-card py-3 shadow-none", motion.card)}>
              <CardContent className="grid min-h-[330px] gap-4">
                <p className="text-body-14-medium text-text-secondary-2">연령층 비율</p>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    {ageDonutData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2.5">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                        <span className="text-caption-12-regular text-text-secondary">
                          {item.name} {Math.round(item.value)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mx-auto w-full max-w-[170px]">
                    <DonutChart data={ageDonutData} heightClassName="h-[170px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid w-full max-w-[760px] gap-3">
            <SetupSectionTitle title="성공 조건" description="페르소나의 최종 도착지를 지정" />
            <TextArea
              placeholder="성공조건을 입력하세요."
              value={successCondition}
              onChange={(event) => setSuccessCondition(event.target.value)}
              variant="default"
              size="md"
              className="h-[104px] resize-none overflow-y-auto overscroll-contain rounded-2xl border-border-soft-2 bg-card px-4 py-3 text-text-secondary placeholder:text-text-muted"
            />
          </section>

        </div>

        <div className="flex min-h-[760px] self-stretch flex-col gap-5 pt-px">
          <SetupSectionTitle title="시뮬레이션 요약" />
          <div className="grid gap-0">
            <SimulationSummaryCard
              projectTitle={projectTitle}
              targetUrl={targetUrl}
              endUrl={endUrl}
              startedAtLabel={startedAt ? `${formatRelativeTime(startedAt)} · ${startedAt.slice(0, 10)}` : "-"}
              personaCount={personaCount}
              personaDevice={personaDevice}
              digitalLiteracy={digitalLiteracy}
              successCondition={successCondition}
              className="rounded-2xl rounded-b-none border-b-0"
            />
            <Card className="rounded-2xl rounded-t-none border border-border-strong bg-surface-subtle py-0 shadow-none ring-0">
              <button
                type="button"
                className="flex h-[72px] w-full items-center justify-center rounded-b-2xl bg-brand-subtle px-4 text-subtitle-18-semibold text-text-link transition-colors hover:bg-brand-subtle-hover"
                onClick={() => {
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
