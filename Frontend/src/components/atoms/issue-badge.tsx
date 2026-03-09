import * as React from "react"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

const issueBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-caption-12-medium",
  {
    variants: {
      variant: {
        error: "border-destructive/30 bg-destructive/10 text-destructive",
        warning: "border-accent bg-accent text-accent-foreground",
        info: "border-primary/20 bg-primary/10 text-primary",
      },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
      },
      state: {
        default: "",
        hover: "brightness-95",
        active: "brightness-90",
        disabled: "opacity-50",
        error: "ring-2 ring-destructive/30",
        loading: "opacity-70",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "md",
      state: "default",
    },
  }
)

const issueIconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const

export interface IssueBadgeProps
  extends React.ComponentProps<"span">,
    Omit<VariantProps<typeof issueBadgeVariants>, "state"> {
  state?: ComponentState
}

function IssueBadge({ className, variant = "info", size, state = "default", children, ...props }: IssueBadgeProps) {
  const variantKey = variant ?? "info"
  const Icon = issueIconMap[variantKey]

  return (
    <span className={cn(issueBadgeVariants({ variant: variantKey, size, state }), className)} {...props}>
      <Icon className="size-3.5" />
      {children}
    </span>
  )
}

export { IssueBadge }
