import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

interface ToggleSwitchFieldProps {
  label: string
  checked: boolean
  description?: string
  state?: ComponentState
  onCheckedChange: (checked: boolean) => void
}

function ToggleSwitchField({
  label,
  checked,
  description,
  state = "default",
  onCheckedChange,
}: ToggleSwitchFieldProps) {
  const isDisabled = state === "disabled" || state === "loading"

  return (
    <label
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border border-border p-3",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="grid gap-1">
        <span className="text-body-14-medium text-foreground">{label}</span>
        {description ? (
          <span className="text-caption-12-regular text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <Switch
        checked={checked}
        disabled={isDisabled}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      />
    </label>
  )
}

export { ToggleSwitchField }
