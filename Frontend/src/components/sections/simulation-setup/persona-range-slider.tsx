import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

function PersonaRangeSlider({
  value,
  min = 100,
  max = 5000,
  step = 100,
  unit = "회",
  color = "var(--color-primary-100)",
  tooltipFormatter,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  unit?: string
  color?: string
  tooltipFormatter?: (value: number) => string
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
    window.addEventListener("resize", updateTrackWidth)

    return () => {
      window.removeEventListener("resize", updateTrackWidth)
    }
  }, [])

  const ratio = (value - min) / (max - min)
  const percent = ratio * 100
  const showTooltip = isHovered || isDragging
  const thumbSize = 20
  const tooltipLeft =
    trackWidth > 0
      ? `calc(${percent}% + ${thumbSize / 2 - ratio * thumbSize}px)`
      : `${percent}%`

  return (
    <div className="grid gap-0.5">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-body-16-medium leading-none text-[#9499B0]">
          {min}
          {unit}
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
              <div className="relative rounded-[8px] bg-[var(--color-neutral-600)] px-2 py-1 text-caption-12-medium leading-none text-white shadow-sm">
                {tooltipFormatter ? tooltipFormatter(value) : value}
                <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-[var(--color-neutral-600)]" />
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
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, var(--color-neutral-300) ${percent}%, var(--color-neutral-300) 100%)`,
            }}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        </div>

        <span className="shrink-0 text-body-16-medium leading-none text-[#9499B0]">
          {max}
          {unit}
        </span>
      </div>
    </div>
  )
}

export { PersonaRangeSlider }
