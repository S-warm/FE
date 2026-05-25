import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

interface SelectionCheckboxProps {
  label: string
  checked: boolean
  state?: ComponentState
  onCheckedChange: (checked: boolean) => void
}

function SelectionCheckbox({
  label,
  checked,
  state = "default",
  onCheckedChange,
}: SelectionCheckboxProps) {
  const isDisabled = state === "disabled" || state === "loading"

  return (
    <label
      className={cn(
        "flex items-center gap-2 text-body-14-regular text-foreground",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
    >
      <Checkbox
        checked={checked}
        disabled={isDisabled}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      />
      {label}
    </label>
  )
}

export { SelectionCheckbox }
