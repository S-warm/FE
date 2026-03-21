import { useMemo, useState } from "react"

import { AlertTriangle, ChevronDown, Eye, Hand, MousePointerClick, Route, ScrollText, Smartphone } from "lucide-react"

import { CommonButton, StatusBadge } from "@/components/atoms"
import { RangeSlider } from "@/components/forms"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { defaultHeatmapPageId, heatmapAgeBands, heatmapPagesMock } from "@/mocks/result-heatmap.mock"
import type { HeatmapAgeBand, HeatmapDevice, HeatmapMode, HeatmapPageMock, HeatmapPoint, HeatmapView } from "@/mocks/result-heatmap.mock"

const deviceOptions: Array<{ value: HeatmapDevice; label: string; icon: React.ReactNode }> = [
  { value: "desktop", label: "Desktop", icon: <Hand className="size-4" /> },
  { value: "mobile", label: "Mobile", icon: <Smartphone className="size-4" /> },
]

const viewOptions: Array<{ value: HeatmapView; label: string }> = [
  { value: "heatmap", label: "Heat map" },
  { value: "journey", label: "Journey" },
]

const modeOptions: Array<{ value: HeatmapMode; label: string; icon: React.ReactNode }> = [
  { value: "click", label: "클릭", icon: <MousePointerClick className="size-4" /> },
  { value: "move", label: "이동", icon: <Route className="size-4" /> },
  { value: "scroll", label: "스크롤", icon: <ScrollText className="size-4" /> },
  { value: "attention", label: "주의", icon: <Eye className="size-4" /> },
]

function PagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#d6ddea] bg-white">
      <img src={src} alt={alt} className="aspect-[16/10] w-full object-cover" />
    </div>
  )
}

function HeatDot({ point }: { point: HeatmapPoint }) {
  const alpha = Math.min(0.85, 0.12 + point.intensity * 0.65)
  const size = 140 + point.intensity * 120

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, rgba(245,121,104,${alpha}) 0%, rgba(245,121,104,0.0) 70%)`,
      }}
      aria-hidden="true"
    />
  )
}

function Marker({ x, y, label, severity }: { x: number; y: number; label: string; severity: "critical" | "warning" }) {
  const isCritical = severity === "critical"
  return (
    <div
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[12px] font-semibold shadow-sm",
        isCritical
          ? "border-[#f57968]/40 bg-[#fff4f1] text-[#e35a48]"
          : "border-[#f6c48b]/50 bg-[#fff8f0] text-[#d97912]"
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={`마커 ${label}`}
    >
      <span className="inline-flex items-center gap-1">
        <AlertTriangle className="size-3.5" />
        {label}
      </span>
    </div>
  )
}

function HeatmapCanvas({
  screenshotUrl,
  points,
  markers,
}: {
  screenshotUrl: string
  points: HeatmapPoint[]
  markers: HeatmapPageMock["markers"]
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#eef1f7] bg-white">
      <img src={screenshotUrl} alt="페이지 스크린샷" className="block h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0">
        {points.map((point) => (
          <HeatDot key={point.id} point={point} />
        ))}
        {markers.map((marker) => (
          <Marker key={marker.id} x={marker.x} y={marker.y} label={marker.label} severity={marker.severity} />
        ))}
      </div>
    </div>
  )
}

function ResultHeatmapPage() {
  const [device, setDevice] = useState<HeatmapDevice>("desktop")
  const [view, setView] = useState<HeatmapView>("heatmap")
  const [selectedPageId, setSelectedPageId] = useState<string>(defaultHeatmapPageId)
  const [expandedPageId, setExpandedPageId] = useState<string>(defaultHeatmapPageId)
  const [mode, setMode] = useState<HeatmapMode>("click")
  const [ageIndex, setAgeIndex] = useState<number>(2)

  const selectedPage = useMemo(() => heatmapPagesMock.find((page) => page.id === selectedPageId) ?? heatmapPagesMock[0], [selectedPageId])
  const selectedAge: HeatmapAgeBand = heatmapAgeBands[Math.min(heatmapAgeBands.length - 1, Math.max(0, ageIndex))] ?? "30대"

  const points = selectedPage.pointsByMode[mode]

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit rounded-2xl border border-[#d6ddea] bg-white shadow-none">
        <CardContent className="grid gap-4 px-4 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-[#e6ebf6] bg-[#fbfcff] p-1">
              {deviceOptions.map((item) => {
                const active = device === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDevice(item.value)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-body-14-medium transition-colors",
                      active ? "bg-white text-[#283452] shadow-sm" : "text-[#66708e] hover:text-[#435176]"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              })}
            </div>

            <Select value={view} onValueChange={(value) => value && setView(value as HeatmapView)}>
              <SelectTrigger className="h-10 rounded-xl border-[#e6ebf6] bg-[#fbfcff] px-3 py-2 text-sm">
                <SelectValue placeholder="보기" />
              </SelectTrigger>
              <SelectContent align="start">
                {viewOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <p className="text-caption-12-medium text-[#66708e]">페이지</p>
            <div className="grid gap-2">
              {heatmapPagesMock.map((page) => {
                const expanded = expandedPageId === page.id
                const isSelected = selectedPageId === page.id
                return (
                  <div key={page.id} className="rounded-2xl border border-[#e6ebf6] bg-[#fbfcff]">
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-body-14-medium transition-colors",
                        isSelected ? "text-[#283452]" : "text-[#66708e] hover:text-[#435176]"
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
        <Card className="rounded-2xl border border-[#d6ddea] bg-white shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-caption-12-regular text-[#8b96a8]">페이지</p>
              <p className="text-body-14-medium text-[#2f3950]">{selectedPage.name}</p>
              <span className="mx-2 h-4 w-px bg-[#e6ebf6]" aria-hidden="true" />
              <p className="text-caption-12-regular text-[#8b96a8]">연령대</p>
              <p className="text-body-14-medium text-[#2f3950]">{selectedAge}</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#eef1f7] bg-[#fbfcff] p-4 lg:grid-cols-[88px_minmax(0,1fr)_280px]">
              <div className="grid content-start gap-2">
                <p className="text-caption-12-medium text-[#66708e]">연령대</p>
                <div className="grid gap-2">
                  {heatmapAgeBands.map((band, index) => {
                    const active = index === ageIndex
                    return (
                      <button
                        key={band}
                        type="button"
                        onClick={() => setAgeIndex(index)}
                        className={cn(
                          "h-10 rounded-xl border px-3 text-body-14-medium transition-colors",
                          active
                            ? "border-[#97a6e3] bg-white text-[#2f5ae8]"
                            : "border-[#e6ebf6] bg-[#f4f6fb] text-[#66708e] hover:bg-white"
                        )}
                      >
                        {band}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-[#e6ebf6] bg-white">
                  {modeOptions.map((item) => {
                    const active = item.value === mode
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setMode(item.value)}
                        className={cn(
                          "relative flex h-10 items-center justify-center gap-2 px-3 text-body-14-medium transition-colors",
                          active ? "text-[#283452]" : "text-[#8b96a8] hover:text-[#435176]"
                        )}
                      >
                        {item.icon}
                        {item.label}
                        <span
                          className={cn(
                            "absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#97a6e3] transition-transform",
                            active ? "scale-x-100" : "scale-x-0"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>

                <HeatmapCanvas screenshotUrl={selectedPage.screenshotUrl} points={points} markers={selectedPage.markers} />

                <RangeSlider
                  value={ageIndex}
                  min={0}
                  max={heatmapAgeBands.length - 1}
                  step={1}
                  color="rgba(151, 166, 227, 0.7)"
                  startLabel={heatmapAgeBands[0]}
                  endLabel={heatmapAgeBands[heatmapAgeBands.length - 1]}
                  labelClassName="text-caption-12-medium text-[#66708e]"
                  tooltipFormatter={(value) => heatmapAgeBands[value] ?? ""}
                  onChange={setAgeIndex}
                />
              </div>

              <div className="grid content-start gap-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-14-medium text-[#2f3950]">치명적 결함</p>
                  <CommonButton
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-xl border border-[#dbe2f1] bg-white text-[#435176] hover:bg-[#eef1f7]"
                    disabled
                  >
                    전체보기
                  </CommonButton>
                </div>

                <div className="grid gap-2">
                  {selectedPage.defects.map((defect, index) => (
                    <Card key={defect.id} className="rounded-2xl border border-[#d6ddea] bg-white shadow-none">
                      <CardContent className="grid gap-2 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="grid size-7 place-items-center rounded-xl bg-[#fff4f1] text-[#f25a3c]">
                                <AlertTriangle className="size-4" />
                              </span>
                              <p className="truncate text-body-14-medium text-[#2f3950]">
                                {defect.code} {defect.title}
                              </p>
                            </div>
                            <p className="mt-1 text-caption-12-regular text-[#8b96a8]">{defect.description}</p>
                          </div>
                          <StatusBadge variant={index === 0 ? "high" : index === 1 ? "medium" : "low"} size="sm">
                            {index === 0 ? "높음" : index === 1 ? "중간" : "낮음"}
                          </StatusBadge>
                        </div>

                        <p className="text-caption-12-medium text-[#2f5ae8]">영향받은 사용자 : {defect.impactedUsers.toLocaleString()} 명</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {view === "journey" ? (
              <p className="text-caption-12-regular text-[#8b96a8]">
                Journey 뷰는 더미 상태입니다. (추후 여정 데이터/경로 렌더링 연동 예정)
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultHeatmapPage

