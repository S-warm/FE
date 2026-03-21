import { useMemo, useRef, useState } from "react"

import { ChevronDown, Hand, Smartphone } from "lucide-react"

import { RangeSlider } from "@/components/forms"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { defaultHeatmapPageId, heatmapAgeBands, heatmapPagesMock } from "@/mocks/result-heatmap.mock"
import type { HeatmapAgeBand, HeatmapDevice, HeatmapPoint } from "@/mocks/result-heatmap.mock"

const deviceOptions: Array<{ value: HeatmapDevice; label: string; icon: React.ReactNode }> = [
  { value: "desktop", label: "Desktop", icon: <Hand className="size-4" /> },
  { value: "mobile", label: "Mobile", icon: <Smartphone className="size-4" /> },
]

function PagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-strong bg-card">
      <img src={src} alt={alt} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
    </div>
  )
}

function JourneyCanvas({ screenshotUrl, points }: { screenshotUrl: string; points: HeatmapPoint[] }) {
  const ordered = [...points].sort((a, b) => a.x - b.x)
  const path = ordered
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-card">
      <img src={screenshotUrl} alt="페이지 스크린샷" loading="lazy" decoding="async" className="block h-full w-full object-cover" />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={path} fill="none" stroke="rgba(47, 90, 232, 0.65)" strokeWidth="1.2" strokeLinecap="round" />
        {ordered.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r={2.3} fill="rgba(255, 204, 0, 0.9)" />
            <circle cx={point.x} cy={point.y} r={5.8} fill="rgba(255, 204, 0, 0.18)" />
          </g>
        ))}
      </svg>
    </div>
  )
}

function ResultJourneyPage() {
  const [device, setDevice] = useState<HeatmapDevice>("desktop")
  const [selectedPageId, setSelectedPageId] = useState<string>(defaultHeatmapPageId)
  const [expandedPageId, setExpandedPageId] = useState<string>(defaultHeatmapPageId)
  const [ageIndex, setAgeIndex] = useState<number>(2)
  const canvasRef = useRef<HTMLDivElement | null>(null)

  const selectedPage = useMemo(
    () => heatmapPagesMock.find((page) => page.id === selectedPageId) ?? heatmapPagesMock[0],
    [selectedPageId]
  )
  const selectedAge: HeatmapAgeBand =
    heatmapAgeBands[Math.min(heatmapAgeBands.length - 1, Math.max(0, ageIndex))] ?? "30대"

  const points = selectedPage.pointsByMode.move

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit rounded-2xl border border-border-strong bg-card shadow-none">
        <CardContent className="grid gap-4 px-4 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border-soft bg-surface-subtle p-1">
              {deviceOptions.map((item) => {
                const active = device === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDevice(item.value)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-body-14-medium transition-colors",
                      active ? "bg-card text-text-strong shadow-sm" : "text-text-muted hover:text-text-secondary"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-caption-12-medium text-text-muted">페이지</p>
            <div className="grid gap-2">
              {heatmapPagesMock.map((page) => {
                const expanded = expandedPageId === page.id
                const isSelected = selectedPageId === page.id
                return (
                  <div key={page.id} className="rounded-2xl border border-border-soft bg-surface-subtle">
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-body-14-medium transition-colors",
                        isSelected ? "text-text-strong" : "text-text-muted hover:text-text-secondary"
                      )}
                      onClick={() => {
                        setSelectedPageId(page.id)
                        setExpandedPageId(page.id)
                      }}
                    >
                      <span className="truncate">{page.name}</span>
                      <ChevronDown className={cn("size-4 transition-transform", expanded ? "rotate-180" : "")} />
                    </button>

                    {expanded ? (
                      <div className="grid gap-2 px-3 pb-3">
                        <PagePreview src={page.screenshotUrl} alt={page.name} />
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-caption-12-regular text-text-subtle">페이지</p>
              <p className="text-body-14-medium text-text-body">{selectedPage.name}</p>
              <span className="mx-2 h-4 w-px bg-border-soft" aria-hidden="true" />
              <p className="text-caption-12-regular text-text-subtle">연령대</p>
              <p className="text-body-14-medium text-text-body">{selectedAge}</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-subtle p-4">
              <p className="text-caption-12-regular text-text-subtle">
                여정 탭은 “이동 경로” 렌더링을 위한 더미 화면입니다. (추후 단계/노드/전환 로그 연동 예정)
              </p>

              <div ref={canvasRef} className="grid gap-3">
                <JourneyCanvas screenshotUrl={selectedPage.screenshotUrl} points={points} />
                <RangeSlider
                  value={ageIndex}
                  min={0}
                  max={heatmapAgeBands.length - 1}
                  step={1}
                  color="rgba(151, 166, 227, 0.7)"
                  startLabel={heatmapAgeBands[0]}
                  endLabel={heatmapAgeBands[heatmapAgeBands.length - 1]}
                  labelClassName="text-caption-12-medium text-text-muted"
                  tooltipFormatter={(value) => heatmapAgeBands[value] ?? ""}
                  onChange={(value) => {
                    setAgeIndex(value)
                    canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultJourneyPage
