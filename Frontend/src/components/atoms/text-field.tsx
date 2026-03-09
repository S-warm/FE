import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

type FieldVariant = "default" | "filled"
type FieldSize = "sm" | "md" | "lg"

const fieldVariantClassMap: Record<FieldVariant, string> = {
  default: "bg-background",
  filled: "bg-muted/40",
}

const fieldSizeClassMap: Record<FieldSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-11 text-base",
}

const fieldStateClassMap: Record<Exclude<ComponentState, "default" | "disabled" | "loading">, string> = {
  hover: "border-primary/50",
  active: "border-primary ring-3 ring-ring/40",
  error: "border-destructive ring-3 ring-destructive/20",
}

export interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, "size"> {
  label?: string
  helperText?: string
  errorMessage?: string
  variant?: FieldVariant
  size?: FieldSize
  state?: ComponentState
}

function TextField({
  id,
  label,
  helperText,
  errorMessage,
  className,
  variant = "default",
  size = "md",
  state = "default",
  disabled,
  ...props
}: TextFieldProps) {
  const fieldId = id ?? React.useId()
  const isDisabled = disabled || state === "disabled" || state === "loading"
  const isError = state === "error" || Boolean(errorMessage)

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-body-14-medium text-foreground">
          {label}
        </label>
      ) : null}

      <Input
        id={fieldId}
        aria-invalid={isError || undefined}
        disabled={isDisabled}
        className={cn(
          fieldVariantClassMap[variant],
          fieldSizeClassMap[size],
          fieldStateClassMap[state as keyof typeof fieldStateClassMap],
          className
        )}
        {...props}
      />

      {isError ? (
        <p className="text-caption-12-medium text-destructive">{errorMessage ?? "입력값을 확인해주세요."}</p>
      ) : helperText ? (
        <p className="text-caption-12-regular text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  )
}

export { TextField }
