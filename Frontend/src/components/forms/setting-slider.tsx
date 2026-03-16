import { useEffect, useState } from "react"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

interface SettingSliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  unit?: string
  size?: "sm" | "md"
  state?: ComponentState
  showLabel?: boolean
  showInlineValue?: boolean
  showFloatingValue?: boolean
  floatingValueFormatter?: (value: number) => string
  className?: string
  onChange: (value: number) => void
}

const sizeClassMap = {
  sm: "gap-2",
  md: "gap-3",
} as const

const stateClassMap: Record<Exclude<ComponentState, "default" | "disabled" | "loading">, string> = {
  hover: "opacity-95",
  active: "scale-[0.998]",
  error: "rounded-lg ring-2 ring-destructive/20 p-2",
}

function SettingSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  size = "md",
  state = "default",
  showLabel = true,
  showInlineValue = true,
  showFloatingValue = false,
  floatingValueFormatter,
  className,
  onChange,
}: SettingSliderProps) {
  const isDisabled = state === "disabled" || state === "loading"
  const progress = ((value - min) / (max - min)) * 100
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

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

  const shouldShowFloatingValue = showFloatingValue && (isHovered || isDragging)

  return (
    <div className={cn("grid", sizeClassMap[size], stateClassMap[state as keyof typeof stateClassMap], className)}>
      {showLabel || showInlineValue ? (
        <div className="flex items-center justify-between">
          {showLabel ? <p className="text-body-14-medium text-[#283452]">{label}</p> : <span />}
          {showInlineValue ? (
            <span className="rounded-md bg-[#eef2ff] px-2 py-1 text-caption-12-medium text-[#4f66bf]">
              {value}
              {unit}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className="relative pt-5"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={() => {
          if (isHovered) {
            setIsDragging(true)
          }
        }}
      >
        {shouldShowFloatingValue ? (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2"
            style={{ left: `calc(${progress}% + (1 - ${progress} / 100) * 0px)` }}
          >
            <div className="relative rounded-[18px] bg-[var(--color-neutral-600)] px-4 py-2 text-[11px] font-medium leading-none text-white shadow-sm">
              {floatingValueFormatter ? floatingValueFormatter(value) : value}
              <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[10px] border-x-transparent border-t-[var(--color-neutral-600)]" />
            </div>
          </div>
        ) : null}
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          disabled={isDisabled}
          onValueChange={(nextValue) => {
            const resolved = Array.isArray(nextValue) ? nextValue[0] : nextValue
            onChange(resolved ?? value)
          }}
        />
      </div>
    </div>
  )
}

export { SettingSlider }
