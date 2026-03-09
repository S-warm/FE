import { X } from "lucide-react"

import { IconButton } from "@/components/atoms"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

interface ChipTagProps extends React.ComponentProps<"button"> {
  removable?: boolean
  selected?: boolean
  state?: ComponentState
  onRemove?: () => void
}

const stateClassMap: Record<Exclude<ComponentState, "default" | "disabled" | "loading">, string> = {
  hover: "brightness-95",
  active: "brightness-90",
  error: "ring-2 ring-destructive/30",
}

function ChipTag({
  className,
  children,
  removable = false,
  selected = false,
  state = "default",
  disabled,
  onRemove,
  ...props
}: ChipTagProps) {
  const isDisabled = disabled || state === "disabled" || state === "loading"

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-body-14-medium transition-colors",
        selected
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:bg-muted",
        stateClassMap[state as keyof typeof stateClassMap],
        isDisabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {removable && onRemove ? (
        <span className="ml-0.5">
          <IconButton
            icon={<X className="size-3" />}
            label="태그 삭제"
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
            disabled={isDisabled}
          />
        </span>
      ) : null}
    </button>
  )
}

export { ChipTag }
