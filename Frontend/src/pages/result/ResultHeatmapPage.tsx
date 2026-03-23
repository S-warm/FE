import { useEffect, useMemo, useRef, useState } from "react"

import { AlertTriangle } from "lucide-react"

import { CommonButton, StatusBadge } from "@/components/atoms"
import { RangeSlider } from "@/components/forms"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"
import { defaultHeatmapPageId, heatmapAgeBands, heatmapPagesMock } from "@/mocks/result-heatmap.mock"
import type { HeatmapAgeBand, HeatmapPageMock, HeatmapPoint, HeatmapTargetRegion } from "@/mocks/result-heatmap.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import { useResultPageParam } from "@/lib/result-page-param"

function HeatDot({ point }: { point: HeatmapPoint }) {
  const alpha = Math.min(0.98, 0.35 + point.intensity * 0.65)
  const size = 84 + point.intensity * 140
  const hue = Math.round(55 - point.intensity * 55) // yellow -> red
  const core = `hsla(${hue}, 96%, 58%, ${alpha})`
  const mid = `hsla(${Math.max(26, hue)}, 96%, 55%, ${Math.min(0.7, alpha * 0.7)})`

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg"
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${core} 0%, ${mid} 42%, rgba(255, 204, 0, 0.0) 72%)`,
      }}
      aria-hidden="true"
    />
  )
}

function Marker({
  x,
  y,
  label,
  severity,
  active,
}: {
  x: number
  y: number
  label: string
  severity: "critical" | "warning"
  active: boolean
}) {
  const isCritical = severity === "critical"
  return (
    <div
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[12px] font-semibold shadow-sm transition-transform",
        isCritical
          ? "border-critical-accent/40 bg-danger-surface text-critical-text"
          : "border-moderate-accent/50 bg-warning-surface text-moderate-text",
        active ? "scale-110 ring-4 ring-text-link/25 animate-pulse" : "scale-100"
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
  activeMarkerLabel,
  targetRegion,
}: {
  screenshotUrl: string
  points: HeatmapPoint[]
  markers: HeatmapPageMock["markers"]
  activeMarkerLabel?: string | null
  targetRegion?: HeatmapTargetRegion
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const [imageAspect, setImageAspect] = useState<number>(1400 / 880)
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [baseSize, setBaseSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  useEffect(() => {
    if (!viewportRef.current) return
    const element = viewportRef.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setViewportSize({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!viewportSize.width || !viewportSize.height || !Number.isFinite(imageAspect) || imageAspect <= 0) return
    const padding = 24
    const maxWidth = Math.max(0, viewportSize.width - padding * 2)
    const maxHeight = Math.max(0, viewportSize.height - padding * 2)
    let width = maxWidth
    let height = width / imageAspect
    if (height > maxHeight) {
      height = maxHeight
      width = height * imageAspect
    }
    setBaseSize({ width, height })
  }, [viewportSize.width, viewportSize.height, imageAspect])

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
  }

  const clipPath = useMemo(() => {
    if (!targetRegion) return undefined
    const top = clamp(targetRegion.y, 0, 100)
    const left = clamp(targetRegion.x, 0, 100)
    const bottom = clamp(100 - (targetRegion.y + targetRegion.height), 0, 100)
    const right = clamp(100 - (targetRegion.x + targetRegion.width), 0, 100)
    return `inset(${top}% ${right}% ${bottom}% ${left}%)`
  }, [targetRegion])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-card h-[clamp(520px,65vh,860px)]">
      <div
        ref={viewportRef}
        className="grid h-full w-full place-items-center bg-surface-subtle p-6"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-border-soft bg-card shadow-sm"
          style={{ width: `${baseSize.width}px`, height: `${baseSize.height}px` }}
        >
          <img
            src={screenshotUrl}
            alt="페이지 스크린샷"
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
            onLoad={(event) => {
              const img = event.currentTarget
              if (img.naturalWidth && img.naturalHeight) {
                setImageAspect(img.naturalWidth / img.naturalHeight)
              }
            }}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              clipPath,
            }}
          >
            {points.map((point) => (
              <HeatDot key={point.id} point={point} />
            ))}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                x={marker.x}
                y={marker.y}
                label={marker.label}
                severity={marker.severity}
                active={Boolean(activeMarkerLabel && marker.label === activeMarkerLabel)}
              />
            ))}
          </div>

          {targetRegion ? (
            <div
              className="pointer-events-none absolute rounded-xl border border-border-focus/60 bg-text-link/5 ring-1 ring-border-focus/25"
              style={{
                left: `${targetRegion.x}%`,
                top: `${targetRegion.y}%`,
                width: `${targetRegion.width}%`,
                height: `${targetRegion.height}%`,
              }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function stripCodeToLabel(code: string) {
  return code.replaceAll("\"", "").trim()
}

function ResultHeatmapPage() {
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const [expandedPageId, setExpandedPageId] = useState<string>(defaultHeatmapPageId)
  const [ageIndex, setAgeIndex] = useState<number>(2)
  const [activeMarkerLabel, setActiveMarkerLabel] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)

  const selectedPage = useMemo(
    () => heatmapPagesMock.find((page) => page.id === selectedPageId) ?? heatmapPagesMock[0],
    [selectedPageId]
  )
  const selectedAge: HeatmapAgeBand = heatmapAgeBands[Math.min(heatmapAgeBands.length - 1, Math.max(0, ageIndex))] ?? "30대"

  const points = selectedPage.pointsByMode.click
  const sidePages = useMemo(
    () =>
      resultPagesMock.map((page) => {
        const defectCount = heatmapPagesMock.find((item) => item.id === page.id)?.defects.length ?? 0
        return {
          id: page.id,
          name: page.name,
          screenshotUrl: page.screenshotUrl,
          metaText: `${defectCount}건 결함`,
        }
      }),
    []
  )

  useEffect(() => {
    setActiveMarkerLabel(null)
  }, [selectedPageId])

  useEffect(() => {
    setExpandedPageId(selectedPageId)
  }, [selectedPageId])

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageId={expandedPageId}
        onSelectPage={(pageId) => {
          setSelectedPageId(pageId)
          setExpandedPageId(pageId)
        }}
        onExpandPage={setExpandedPageId}
      />

      <div className="grid gap-4">
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-caption-12-regular text-text-subtle">페이지</p>
                <p className="text-body-14-medium text-text-body">{selectedPage.name}</p>
                <span className="mx-2 h-4 w-px bg-border-soft" aria-hidden="true" />
                <p className="text-caption-12-regular text-text-subtle">연령대</p>
                <p className="text-body-14-medium text-text-body">{selectedAge}</p>
              </div>

              <RangeSlider
                className="w-full max-w-[520px] md:w-[380px]"
                value={ageIndex}
                min={0}
                max={heatmapAgeBands.length - 1}
                step={1}
                color="rgba(151, 166, 227, 0.7)"
                startLabel={heatmapAgeBands[0]}
                endLabel={heatmapAgeBands[heatmapAgeBands.length - 1]}
                labelClassName="text-caption-12-medium text-text-muted"
                tooltipFormatter={(value) => heatmapAgeBands[value] ?? ""}
                onChange={setAgeIndex}
              />
            </div>

            <div ref={canvasRef} className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-subtle p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                <div className="grid gap-3">
                  <HeatmapCanvas
                    screenshotUrl={selectedPage.screenshotUrl}
                    points={points}
                    markers={selectedPage.markers}
                    activeMarkerLabel={activeMarkerLabel}
                    targetRegion={selectedPage.targetRegion}
                  />
                </div>

                <section className="grid gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-14-medium text-text-body">치명적 결함</p>
                    <CommonButton
                      size="sm"
                      variant="secondary"
                      className="h-8 rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-hover"
                      disabled
                    >
                      전체보기
                    </CommonButton>
                  </div>

                  <div className="grid gap-2">
                    {selectedPage.defects.map((defect, index) => (
                      <Card key={defect.id} className="rounded-2xl border border-border-strong bg-card shadow-none">
                        <CardContent className="grid gap-2 px-4 py-3">
                          <button
                            type="button"
                            className="flex items-start justify-between gap-3 text-left"
                            onClick={() => {
                              const label = stripCodeToLabel(defect.code)
                              setActiveMarkerLabel(label)
                              canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                            }}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="grid size-7 place-items-center rounded-xl bg-danger-surface text-danger-text">
                                  <AlertTriangle className="size-4" />
                                </span>
                                <p className="truncate text-body-14-medium text-text-body">
                                  {defect.code} {defect.title}
                                </p>
                              </div>
                              <p className="mt-1 text-caption-12-regular text-text-subtle">{defect.description}</p>
                            </div>
                            <StatusBadge variant={index === 0 ? "high" : index === 1 ? "medium" : "low"} size="sm">
                              {index === 0 ? "높음" : index === 1 ? "중간" : "낮음"}
                            </StatusBadge>
                          </button>

                          <p className="text-caption-12-medium text-text-link">
                            영향받은 사용자 : {defect.impactedUsers.toLocaleString()} 명
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid gap-2">
                <p className="text-caption-12-medium text-text-muted">연령대</p>
                <div className="flex flex-wrap gap-2">
                  {heatmapAgeBands.map((band, index) => {
                    const active = index === ageIndex
                    return (
                      <button
                        key={band}
                        type="button"
                        onClick={() => setAgeIndex(index)}
                        className={cn(
                          "h-10 rounded-xl border px-4 text-body-14-medium transition-colors",
                          active
                            ? "border-border-focus bg-card text-text-link"
                            : "border-border-soft bg-surface-muted text-text-muted hover:bg-card"
                        )}
                      >
                        {band}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultHeatmapPage
