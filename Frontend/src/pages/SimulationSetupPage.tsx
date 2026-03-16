import { useEffect, useMemo, useRef, useState } from "react"

import { DonutChart } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
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

function SimulationSetupPage() {
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

  const redistributeAgeRatio = (changedKey: keyof typeof ageRatios, nextValue: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(nextValue)))
    const otherKeys = (Object.keys(ageRatios) as Array<keyof typeof ageRatios>).filter(
      (key) => key !== changedKey
    )
    const remaining = 100 - clamped
    const otherTotal = otherKeys.reduce((sum, key) => sum + ageRatios[key], 0)

    const nextState = { ...ageRatios, [changedKey]: clamped }

    if (remaining <= 0) {
      otherKeys.forEach((key) => {
        nextState[key] = 0
      })
      setAgeRatios(nextState)
      return
    }

    if (otherTotal <= 0) {
      const split = Math.floor(remaining / otherKeys.length)
      let rest = remaining
      otherKeys.forEach((key, index) => {
        const value = index === otherKeys.length - 1 ? rest : split
        nextState[key] = value
        rest -= value
      })
      setAgeRatios(nextState)
      return
    }

    let allocated = 0
    otherKeys.forEach((key, index) => {
      const value =
        index === otherKeys.length - 1
          ? remaining - allocated
          : Math.round((ageRatios[key] / otherTotal) * remaining)
      nextState[key] = value
      allocated += value
    })

    const correction =
      100 -
      ((Object.keys(nextState) as Array<keyof typeof nextState>).reduce((sum, key) => sum + nextState[key], 0))
    nextState[otherKeys[otherKeys.length - 1]] += correction
    setAgeRatios(nextState)
  }

  useEffect(() => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current)
    }

    const start = performance.now()
    const from = displayAgeRatios
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
      { name: "10대", value: displayAgeRatios.teen, color: "#c8d0f6" },
      { name: "50대", value: displayAgeRatios.fifty, color: "#d5b8f3" },
      { name: "80대", value: displayAgeRatios.eighty, color: "#7edfe6" },
    ],
    [displayAgeRatios]
  )

  const summaryAgeRatios = useMemo(
    () => [
      { label: "10대", value: Math.round(displayAgeRatios.teen) },
      { label: "50대", value: Math.round(displayAgeRatios.fifty) },
      { label: "80대", value: Math.round(displayAgeRatios.eighty) },
    ],
    [displayAgeRatios]
  )

  return (
    <AuthLayout
      mainClassName="items-start justify-start overflow-hidden pb-0"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section className="grid w-full max-w-[1560px] gap-16 pb-0 pt-2 pl-20 sm:grid-cols-[760px_400px] sm:pl-28">
        <div className="grid gap-5">
          <section className="grid w-full max-w-[760px] gap-3">
            <SetupSectionTitle title="타겟 URL" description="시뮬레이션이 시작되는 페이지" />
            <TextField
              placeholder="URL 링크를 입력하세요."
              variant="default"
              size="lg"
              className="h-11 rounded-xl border-[#cfd7ea] bg-white px-4 text-[#435176] placeholder:text-[#a0a8bb]"
            />
          </section>

          <section className="grid w-full max-w-[760px] gap-4 md:grid-cols-[minmax(0,1.50fr)_minmax(0,0.70fr)]">
            <div className="grid gap-3">
              <SetupSectionTitle
                title="페르소나 횟수"
                description="테스트에 사용할 시뮬레이션별 페르소나 양"
              />
              <Card className="h-[68px] rounded-2xl border border-[#cdd6ea] bg-white py-2 shadow-none">
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

              <div className="grid gap-3">
                <Card className="rounded-2xl border border-[#cdd6ea] bg-white py-2 shadow-none">
                  <CardContent className="grid gap-2 md:grid-cols-[148px_minmax(0,1fr)] md:items-center">
                    <div className="rounded-xl bg-[#f8f8f8] px-3 py-2.5">
                      <p className="text-subtitle-20-medium text-[var(--color-primary-600)]">10대</p>
                      <p className="mt-1 text-body-14-regular text-[#9aa3b9]">
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
                      color="#c8d0f6"
                      tooltipFormatter={(value) => `${value}%`}
                      onChange={(value) => redistributeAgeRatio("teen", value)}
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-[#cdd6ea] bg-white py-2 shadow-none">
                  <CardContent className="grid gap-2 md:grid-cols-[148px_minmax(0,1fr)] md:items-center">
                    <div className="rounded-xl bg-[#f8f8f8] px-3 py-2.5">
                      <p className="text-subtitle-20-medium text-[var(--color-primary-600)]">50대</p>
                      <p className="mt-1 text-body-14-regular text-[#9aa3b9]">안정성과 신뢰를 중시하는 중장년층</p>
                    </div>
                    <PersonaRangeSlider
                      value={ageRatios.fifty}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      color="#d5b8f3"
                      tooltipFormatter={(value) => `${value}%`}
                      onChange={(value) => redistributeAgeRatio("fifty", value)}
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-[#cdd6ea] bg-white py-2 shadow-none">
                  <CardContent className="grid gap-2 md:grid-cols-[148px_minmax(0,1fr)] md:items-center">
                    <div className="rounded-xl bg-[#f8f8f8] px-3 py-2.5">
                      <p className="text-subtitle-20-medium text-[var(--color-primary-600)]">80대</p>
                      <p className="mt-1 text-body-14-regular text-[#9aa3b9]">접근성 개선이 필요한 디지털 소외계층</p>
                    </div>
                    <PersonaRangeSlider
                      value={ageRatios.eighty}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      color="#7edfe6"
                      tooltipFormatter={(value) => `${value}%`}
                      onChange={(value) => redistributeAgeRatio("eighty", value)}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="mt-[16px] self-end rounded-2xl border border-[#cdd6ea] bg-white py-3 shadow-none">
              <CardContent className="grid min-h-[330px] gap-4">
                <p className="text-body-14-medium text-[#5b6990]">연령층 비율</p>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    {ageDonutData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2.5">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                        <span className="text-caption-12-regular text-[#56627f]">
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
            className="h-[112px] resize-none overflow-y-auto overscroll-contain rounded-2xl border-[#cfd7ea] bg-white px-4 py-3 text-[#435176] placeholder:text-[#a0a8bb]"
          />
          </section>

        </div>

        <div className="grid min-h-[760px] self-stretch grid-rows-[auto_minmax(0,1fr)_auto] gap-5 pt-px">
          <SetupSectionTitle title="시뮬레이션 요약" />
          <SimulationSummaryCard
            personaCount={personaCount}
            digitalLiteracy={digitalLiteracy}
            ageRatios={summaryAgeRatios}
            successCondition={successCondition}
            className="min-h-[560px] self-end"
          />
          <button
            type="button"
            className="flex h-[72px] w-full items-center justify-center self-end rounded-2xl bg-[#e3e8fb] px-4 text-subtitle-18-semibold text-[var(--color-primary-main)] transition-colors hover:bg-[#d8e0fb]"
          >
            시뮬레이션 시작
          </button>
        </div>
      </section>
    </AuthLayout>
  )
}

export default SimulationSetupPage
