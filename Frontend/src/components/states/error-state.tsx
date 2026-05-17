import { AlertTriangle, RefreshCw } from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { cn } from "@/lib/utils"

function ErrorState({
  title = "일시적인 오류가 발생했습니다",
  description = "잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.",
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
        "grid place-items-center rounded-2xl border border-danger-border bg-danger-surface/40 px-6 py-10 text-center",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="grid max-w-[420px] gap-3">
        <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-danger-surface text-danger-text">
          <AlertTriangle className="size-5" />
        </span>
        <div className="grid gap-1.5">
          <p className="text-body-14-medium text-text-body">{title}</p>
          <p className="text-caption-12-regular text-text-muted">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <div className="pt-1">
            <CommonButton
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-xl border border-border-soft-2 bg-card text-text-secondary hover:bg-surface-subtle"
              onClick={onAction}
            >
              <RefreshCw className="size-4" />
              {actionLabel}
            </CommonButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { ErrorState }
