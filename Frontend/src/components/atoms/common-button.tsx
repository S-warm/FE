import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

type CommonButtonVariant = "primary" | "secondary" | "ghost"
type CommonButtonSize = "sm" | "md" | "lg"

const sizeClassMap: Record<CommonButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
}

const variantMap: Record<CommonButtonVariant, "default" | "secondary" | "ghost"> = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
}

const stateClassMap: Record<Exclude<ComponentState, "disabled" | "loading" | "default">, string> = {
  hover: "brightness-95",
  active: "scale-[0.99] brightness-90",
  error: "ring-2 ring-destructive/40",
}

export interface CommonButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size"> {
  variant?: CommonButtonVariant
  size?: CommonButtonSize
  state?: ComponentState
  loadingText?: string
}

function CommonButton({
  children,
  className,
  variant = "primary",
  size = "md",
  state = "default",
  disabled,
  loadingText = "처리 중...",
  ...props
}: CommonButtonProps) {
  const isLoading = state === "loading"
  const isDisabled = disabled || state === "disabled" || isLoading

  return (
    <Button
      variant={variantMap[variant]}
      className={cn(sizeClassMap[size], stateClassMap[state as keyof typeof stateClassMap], className)}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

export { CommonButton }
