import { cn } from "@/lib/utils"
import { DigitalLiteracyDetailModal } from "@/components/sections/simulation-setup/digital-literacy-detail-modal"

type DigitalLiteracyLevel = "low" | "medium" | "high"

const OPTIONS: Array<{ label: string; value: DigitalLiteracyLevel }> = [
  { label: "상", value: "high" },
  { label: "중", value: "medium" },
  { label: "하", value: "low" },
]

function DigitalLiteracySelector({
  value,
  onChange,
  className,
  showDetailTrigger = true,
}: {
  value: DigitalLiteracyLevel
  onChange: (value: DigitalLiteracyLevel) => void
  className?: string
  showDetailTrigger?: boolean
}) {
  return (
    <div className={cn("flex items-center rounded-xl border border-border-soft-2 bg-card p-0.5", className)}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "flex-[0.8] rounded-md px-1.5 py-1 text-body-14-medium transition-colors",
            value === option.value
              ? "bg-brand-accent text-primary-foreground"
              : "text-text-muted hover:bg-surface-hover hover:text-text-secondary"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}

      {showDetailTrigger ? (
        <DigitalLiteracyDetailModal
          triggerClassName="ml-1 flex-[1.35] rounded-md border border-border-soft-2 bg-surface-muted px-3 text-caption-12-medium text-text-muted hover:bg-surface-muted-hover"
        />
      ) : null}
    </div>
  )
}

export { DigitalLiteracySelector }
export type { DigitalLiteracyLevel }
