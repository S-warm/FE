import { cn } from "@/lib/utils"

import { DigitalLiteracyDetailModal } from "@/components/sections/simulation-setup/digital-literacy-detail-modal"
import type { DigitalLiteracyLevel } from "@/features/simulation-setup/model/types"
import { digitalLiteracyOptions } from "@/features/simulation-setup/ui/literacy-options"

function DigitalLiteracySelector({
  value,
  onChange,
  className,
}: {
  value: DigitalLiteracyLevel
  onChange: (value: DigitalLiteracyLevel) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center rounded-xl border border-border-soft-3 bg-card p-0.5", className)}>
      {digitalLiteracyOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={cn(
            "flex-[0.8] rounded-md px-1.5 py-1 text-body-14-medium transition-colors",
            value === option.value
              ? "bg-brand-accent text-white"
              : "text-text-secondary-2 hover:bg-surface-hover hover:text-text-secondary"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}

      <DigitalLiteracyDetailModal
        triggerClassName="ml-1 flex-[1.35] rounded-md border border-border-soft-2 bg-surface-muted px-3 text-caption-12-medium text-text-muted hover:bg-surface-muted-hover"
      />
    </div>
  )
}

export { DigitalLiteracySelector }
export type { DigitalLiteracyLevel }
