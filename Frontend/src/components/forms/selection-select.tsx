import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

interface SelectOption {
  label: string
  value: string
}

interface SelectionSelectProps {
  label?: string
  placeholder?: string
  value: string
  options: SelectOption[]
  size?: "sm" | "md"
  state?: ComponentState
  onChange: (value: string) => void
}

const sizeClassMap = {
  sm: "h-8",
  md: "h-10",
} as const

const stateClassMap: Record<Exclude<ComponentState, "default" | "disabled" | "loading">, string> = {
  hover: "border-primary/50",
  active: "border-primary ring-3 ring-ring/40",
  error: "border-destructive ring-3 ring-destructive/20",
}

function SelectionSelect({
  label,
  placeholder = "선택하세요",
  value,
  options,
  size = "md",
  state = "default",
  onChange,
}: SelectionSelectProps) {
  const isDisabled = state === "disabled" || state === "loading"

  return (
    <div className="grid gap-1.5">
      {label ? <p className="text-body-14-medium text-foreground">{label}</p> : null}
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onChange(nextValue)
          }
        }}
        disabled={isDisabled}
      >
        <SelectTrigger
          className={cn(
            "w-full",
            sizeClassMap[size],
            stateClassMap[state as keyof typeof stateClassMap]
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { SelectionSelect }
export type { SelectOption }
