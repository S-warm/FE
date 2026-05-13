import { AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

function InlineError({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  if (!message) return null

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-caption-12-regular text-danger-text",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  )
}

export { InlineError }
