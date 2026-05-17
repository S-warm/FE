import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

function RangeSlider({
  value,
  min,
  max,
  step,
  unit,
  color = "var(--color-primary-100)",
  ariaLabel,
  startLabel,
  endLabel,
  labelClassName,
  tooltipFormatter,
  className,
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  unit?: string
  color?: string
  ariaLabel?: string
  startLabel?: ReactNode
  endLabel?: ReactNode
  labelClassName?: string
  tooltipFormatter?: (value: number) => string
  className?: string
  onChange: (value: number) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [trackWidth, setTrackWidth] = useState(0)
  const trackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isDragging) return

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [isDragging])

  useEffect(() => {
    const updateTrackWidth = () => {
      setTrackWidth(trackRef.current?.offsetWidth ?? 0)
    }

    updateTrackWidth()
    const element = trackRef.current
    if (!element) return

    const observer = new ResizeObserver(() => {
      updateTrackWidth()
    })
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const range = max - min
  const ratio = range > 0 ? (value - min) / range : 0
  const clampedRatio = Math.min(1, Math.max(0, ratio))
  const percent = clampedRatio * 100
  const showTooltip = isHovered || isDragging
  const thumbSize = 20
  const tooltipLeft =
    trackWidth > 0
      ? `calc(${percent}% + ${thumbSize / 2 - clampedRatio * thumbSize}px)`
      : `${percent}%`

  return (
    <div className={cn("grid gap-0.5", className)}>
      <div className="flex items-start gap-2">
        <span className={cn("shrink-0 pt-7 text-body-16-medium leading-none text-text-subtle", labelClassName)}>
          {startLabel ?? (
            <>
              {min}
              {unit}
            </>
          )}
        </span>

        <div
          ref={trackRef}
          className="relative flex-1 pt-7"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onPointerDown={() => setIsDragging(true)}
        >
          {showTooltip ? (
            <div
              className="pointer-events-none absolute left-0 top-0 z-10 -translate-x-1/2"
              style={{ left: tooltipLeft }}
            >
              <div className="relative rounded-lg bg-code-surface px-2 py-1 text-caption-12-medium leading-none text-white shadow-sm">
                {tooltipFormatter ? tooltipFormatter(value) : value}
                <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-code-surface" />
              </div>
            </div>
          ) : null}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={cn("persona-range")}
            aria-label={ariaLabel}
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, var(--border-soft-2) ${percent}%, var(--border-soft-2) 100%)`,
            }}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        </div>

        <span className={cn("shrink-0 pt-7 text-body-16-medium leading-none text-text-subtle", labelClassName)}>
          {endLabel ?? (
            <>
              {max}
              {unit}
            </>
          )}
        </span>
      </div>
    </div>
  )
}

export { RangeSlider }
