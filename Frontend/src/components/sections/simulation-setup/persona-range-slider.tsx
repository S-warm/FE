import { RangeSlider } from "@/components/forms"

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
  return (
    <RangeSlider
      value={value}
      min={min}
      max={max}
      step={step}
      unit={unit}
      color={color}
      tooltipFormatter={tooltipFormatter}
      onChange={onChange}
    />
  )
}

export { PersonaRangeSlider }
