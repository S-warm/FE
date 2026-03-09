import { Search, X } from "lucide-react"

import { IconButton } from "@/components/atoms"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

interface SearchFieldProps extends Omit<React.ComponentProps<typeof Input>, "size" | "type"> {
  state?: ComponentState
  onClear?: () => void
}

const stateClassMap: Record<Exclude<ComponentState, "default" | "disabled" | "loading">, string> = {
  hover: "border-primary/50",
  active: "border-primary ring-3 ring-ring/40",
  error: "border-destructive ring-3 ring-destructive/20",
}

function SearchField({ className, state = "default", disabled, onClear, value, ...props }: SearchFieldProps) {
  const isDisabled = disabled || state === "disabled" || state === "loading"
  const hasValue = typeof value === "string" && value.length > 0

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        disabled={isDisabled}
        className={cn("h-10 pl-9 pr-9", stateClassMap[state as keyof typeof stateClassMap], className)}
        {...props}
      />
      {hasValue && onClear ? (
        <div className="absolute top-1/2 right-1 -translate-y-1/2">
          <IconButton
            icon={<X className="size-3.5" />}
            label="검색어 지우기"
            size="sm"
            onClick={onClear}
            disabled={isDisabled}
          />
        </div>
      ) : null}
    </div>
  )
}

export { SearchField }
