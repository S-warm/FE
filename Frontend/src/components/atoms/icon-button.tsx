import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

type IconButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
type IconButtonSize = "sm" | "md" | "lg"

const iconVariantMap: Record<IconButtonVariant, "default" | "secondary" | "ghost" | "destructive"> = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
  destructive: "destructive",
}

const iconSizeMap: Record<IconButtonSize, "icon-xs" | "icon-sm" | "icon" | "icon-lg"> = {
  sm: "icon-sm",
  md: "icon",
  lg: "icon-lg",
}

const stateClassMap: Record<Exclude<ComponentState, "disabled" | "loading" | "default">, string> = {
  hover: "brightness-95",
  active: "scale-[0.98] brightness-90",
  error: "ring-2 ring-destructive/40",
}

export interface IconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "size" | "variant" | "children"> {
  icon: React.ReactNode
  label: string
  variant?: IconButtonVariant
  size?: IconButtonSize
  state?: ComponentState
}

function IconButton({
  icon,
  label,
  className,
  variant = "ghost",
  size = "md",
  state = "default",
  disabled,
  ...props
}: IconButtonProps) {
  const isLoading = state === "loading"
  const isDisabled = disabled || state === "disabled" || isLoading

  return (
    <Button
      type="button"
      variant={iconVariantMap[variant]}
      size={iconSizeMap[size]}
      className={cn(stateClassMap[state as keyof typeof stateClassMap], className)}
      disabled={isDisabled}
      aria-label={label}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : icon}
    </Button>
  )
}

export { IconButton }
