import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DonutDatum } from "@/mocks/data-visualization.mock"

export interface DonutSliceDetail {
  label: string
  count: number
  percent: number
}

export interface DonutDatumWithDetail extends DonutDatum {
  count?: number
  percent?: number
  details?: {
    high: number
    mid: number
    low: number
    items: DonutSliceDetail[]
  }
}

interface DonutChartDetailProps {
  data: DonutDatumWithDetail[]
  heightClassName?: string
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function buildArcPath(cx: number, cy: number, innerR: number, outerR: number, startDeg: number, endDeg: number) {
  const s1 = polarToCartesian(cx, cy, outerR, startDeg)
  const e1 = polarToCartesian(cx, cy, outerR, endDeg)
  const s2 = polarToCartesian(cx, cy, innerR, endDeg)
  const e2 = polarToCartesian(cx, cy, innerR, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return ["M " + s1.x + " " + s1.y, "A " + outerR + " " + outerR + " 0 " + large + " 1 " + e1.x + " " + e1.y, "L " + s2.x + " " + s2.y, "A " + innerR + " " + innerR + " 0 " + large + " 0 " + e2.x + " " + e2.y, "Z"].join(" ")
}

function buildSeverityArcs(details: NonNullable<DonutDatumWithDetail["details"]>) {
  const circumference = 2 * Math.PI * 20
  const segments = [
    { label: "high", color: "#f87171", value: details.high },
    { label: "mid", color: "#fbbf24", value: details.mid },
    { label: "low", color: "#d1d5db", value: details.low },
  ]
  let offset = 0
  return segments.map(({ label, color, value }) => {
    const dash = (value / 100) * circumference
    const arc = { label, color, dash, gap: circumference - dash, offset: -offset }
    offset += dash
    return arc
  })
}

function DonutChartDetail({ data, heightClassName = "h-[220px]" }: DonutChartDetailProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const anchorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeIndex === null) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const animate = () => {
      const targetY = anchorRef.current.y - window.scrollY
      const targetX = anchorRef.current.x

      currentPosRef.current.x += (targetX - currentPosRef.current.x) * 0.15
      currentPosRef.current.y += (targetY - currentPosRef.current.y) * 0.15

      if (popupRef.current) {
        popupRef.current.style.top = currentPosRef.current.y + "px"
        popupRef.current.style.left = currentPosRef.current.x + "px"
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [activeIndex])

  const cx = 100
  const cy = 100
  const innerR = 52
  const outerR = 80
  const gap = 2
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  let currentDeg = 0
  const slices = data.map((d, i) => {
    const angleDeg = (d.value / total) * 360
    const startDeg = currentDeg + gap / 2
    const endDeg = currentDeg + angleDeg - gap / 2
    currentDeg += angleDeg
    return { ...d, startDeg, endDeg, index: i }
  })

  const activeItem = activeIndex !== null ? data[activeIndex] : null

  return (
    <div className={cn(heightClassName, "relative flex w-full items-center justify-center")}>
      <div className="relative">
        <svg width={200} height={200} viewBox="0 0 200 200">
          {slices.map((slice) => (
            <path
              key={slice.name}
              d={buildArcPath(cx, cy, innerR, outerR, slice.startDeg, slice.endDeg)}
              fill={slice.color}
              opacity={activeIndex !== null ? (activeIndex === slice.index ? 1 : 0.4) : (hoveredIndex === null || hoveredIndex === slice.index ? 1 : 0.4)}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => {
                if (activeIndex === slice.index) {
                  setActiveIndex(null)
                } else {
                  const x = e.clientX + 8
                  const y = e.clientY + window.scrollY + 8
                  anchorRef.current = { x, y }
                  currentPosRef.current = { x, y: e.clientY + 8 }
                  setActiveIndex(slice.index)
                }
              }}
            />
          ))}
        </svg>
      </div>

      {activeItem && (
        <div
          ref={popupRef}
          className="fixed z-[9999] w-52 rounded-2xl border border-border-strong bg-card p-4 shadow-lg"
          style={{ top: anchorRef.current.y - window.scrollY, left: anchorRef.current.x }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: activeItem.color }} />
              <p className="text-body-14-medium text-text-body">{activeItem.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="grid size-5 place-items-center rounded-md text-text-subtle hover:bg-surface-hover"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {activeItem.details ? (
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="relative size-14 shrink-0">
                  <svg viewBox="0 0 56 56" className="size-full -rotate-90">
                    {buildSeverityArcs(activeItem.details).map((arc) => (
                      <circle
                        key={arc.label}
                        cx="28"
                        cy="28"
                        r="20"
                        fill="none"
                        stroke={arc.color}
                        strokeWidth="8"
                        strokeDasharray={arc.dash + " " + arc.gap}
                        strokeDashoffset={arc.offset}
                      />
                    ))}
                  </svg>
                </div>
                <div className="grid gap-1">
                  {[
                    { label: "높음", value: activeItem.details.high, color: "#f87171" },
                    { label: "중간", value: activeItem.details.mid, color: "#fbbf24" },
                    { label: "낮음", value: activeItem.details.low, color: "#d1d5db" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                      <p className="text-caption-12-regular text-text-subtle">{label} ({value}%)</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-1.5">
                {activeItem.details.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: activeItem.color }} />
                      <p className="text-caption-12-regular text-text-subtle">{item.label}</p>
                    </div>
                    <p className="shrink-0 text-caption-12-medium text-text-muted">{item.count}건 / {item.percent}%</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-caption-12-regular text-text-subtle">이슈 없음</p>
          )}
        </div>
      )}
    </div>
  )
}

export { DonutChartDetail }
