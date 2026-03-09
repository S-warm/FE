import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-caption-12-medium",
  {
    variants: {
      variant: {
        high: "border-destructive/30 bg-destructive/10 text-destructive",
        medium: "border-accent bg-accent text-accent-foreground",
        low: "border-secondary bg-secondary text-secondary-foreground",
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
      variant: "medium",
      size: "md",
      state: "default",
    },
  }
)

export interface StatusBadgeProps
  extends React.ComponentProps<"span">,
    Omit<VariantProps<typeof statusBadgeVariants>, "state"> {
  state?: ComponentState
}

function StatusBadge({ className, variant, size, state = "default", ...props }: StatusBadgeProps) {
  return <span className={cn(statusBadgeVariants({ variant, size, state }), className)} {...props} />
}

export { StatusBadge }
