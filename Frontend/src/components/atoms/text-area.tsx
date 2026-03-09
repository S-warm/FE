import * as React from "react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

type TextAreaVariant = "default" | "filled"
type TextAreaSize = "sm" | "md" | "lg"

const variantClassMap: Record<TextAreaVariant, string> = {
  default: "bg-background",
  filled: "bg-muted/40",
}

const sizeClassMap: Record<TextAreaSize, string> = {
  sm: "min-h-20 text-sm",
  md: "min-h-24 text-sm",
  lg: "min-h-28 text-base",
}

const stateClassMap: Record<Exclude<ComponentState, "default" | "disabled" | "loading">, string> = {
  hover: "border-primary/50",
  active: "border-primary ring-3 ring-ring/40",
  error: "border-destructive ring-3 ring-destructive/20",
}

export interface TextAreaProps extends Omit<React.ComponentProps<typeof Textarea>, "size"> {
  label?: string
  helperText?: string
  errorMessage?: string
  variant?: TextAreaVariant
  size?: TextAreaSize
  state?: ComponentState
}

function TextArea({
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
}: TextAreaProps) {
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

      <Textarea
        id={fieldId}
        aria-invalid={isError || undefined}
        disabled={isDisabled}
        className={cn(
          variantClassMap[variant],
          sizeClassMap[size],
          stateClassMap[state as keyof typeof stateClassMap],
          className
        )}
        {...props}
      />

      {isError ? (
        <p className="text-caption-12-medium text-destructive">{errorMessage ?? "내용을 확인해주세요."}</p>
      ) : helperText ? (
        <p className="text-caption-12-regular text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  )
}

export { TextArea }
