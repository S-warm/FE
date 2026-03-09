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
  onChange,
}: SettingSliderProps) {
  const isDisabled = state === "disabled" || state === "loading"

  return (
    <div className={cn("grid", sizeClassMap[size], stateClassMap[state as keyof typeof stateClassMap])}>
      <div className="flex items-center justify-between">
        <p className="text-body-14-medium text-foreground">{label}</p>
        <span className="rounded-md bg-secondary px-2 py-1 text-caption-12-medium text-secondary-foreground">
          {value}
          {unit}
        </span>
      </div>
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
  )
}

export { SettingSlider }
