import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

interface RadioOption {
  label: string
  value: string
}

interface SelectionRadioGroupProps {
  label?: string
  value: string
  options: RadioOption[]
  state?: ComponentState
  onChange: (value: string) => void
}

function SelectionRadioGroup({
  label,
  value,
  options,
  state = "default",
  onChange,
}: SelectionRadioGroupProps) {
  const isDisabled = state === "disabled" || state === "loading"

  return (
    <div className="grid gap-2">
      {label ? <p className="text-body-14-medium text-foreground">{label}</p> : null}
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className={cn("grid gap-2", isDisabled && "opacity-50")}
      >
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-body-14-regular text-foreground">
            <RadioGroupItem value={option.value} disabled={isDisabled} />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}

export { SelectionRadioGroup }
export type { RadioOption }
