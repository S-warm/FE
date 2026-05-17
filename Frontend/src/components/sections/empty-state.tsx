import { Info } from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { cn } from "@/lib/utils"

function EmptyState({
  title = "데이터가 없습니다",
  description = "시뮬레이션을 시작하면 데이터가 표시됩니다.",
  actionLabel,
  onAction,
  className,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl border border-border-soft bg-surface-subtle px-6 py-10 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="grid max-w-[360px] gap-2">
        <span className="mx-auto grid size-10 place-items-center rounded-2xl bg-surface-muted text-text-secondary">
          <Info className="size-5" />
        </span>
        <p className="text-body-14-medium text-text-body">{title}</p>
        <p className="text-caption-12-regular text-text-muted">{description}</p>
        {actionLabel && onAction ? (
          <div className="pt-2">
            <CommonButton
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-subtle"
              onClick={onAction}
            >
              {actionLabel}
            </CommonButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { EmptyState }
