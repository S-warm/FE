import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { IconButton } from "@/components/atoms/icon-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ComponentState } from "@/types/ui"

type PasswordFieldVariant = "default" | "filled"
type PasswordFieldSize = "sm" | "md" | "lg"

const variantClassMap: Record<PasswordFieldVariant, string> = {
  default: "bg-background",
  filled: "bg-muted/40",
}

const sizeClassMap: Record<PasswordFieldSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-11 text-base",
}

const stateClassMap: Record<Exclude<ComponentState, "default" | "disabled" | "loading">, string> = {
  hover: "border-primary/50",
  active: "border-primary ring-3 ring-ring/40",
  error: "border-destructive ring-3 ring-destructive/20",
}

export interface PasswordFieldProps extends Omit<React.ComponentProps<typeof Input>, "size" | "type"> {
  label?: string
  helperText?: string
  errorMessage?: string
  variant?: PasswordFieldVariant
  size?: PasswordFieldSize
  state?: ComponentState
}

function PasswordField({
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
}: PasswordFieldProps) {
  const fallbackId = React.useId()
  const fieldId = id ?? fallbackId
  const [visible, setVisible] = React.useState(false)

  const isDisabled = disabled || state === "disabled" || state === "loading"
  const isError = state === "error" || Boolean(errorMessage)

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-body-14-medium text-foreground">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <Input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={isError || undefined}
          disabled={isDisabled}
          className={cn(
            "pr-10",
            variantClassMap[variant],
            sizeClassMap[size],
            stateClassMap[state as keyof typeof stateClassMap],
            className
          )}
          {...props}
        />
        <div className="absolute top-1/2 right-1 -translate-y-1/2">
          <IconButton
            label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
            icon={visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            size="sm"
            variant="ghost"
            disabled={isDisabled}
            onClick={() => setVisible((prev) => !prev)}
          />
        </div>
      </div>

      {isError ? (
        <p className="text-caption-12-medium text-destructive">{errorMessage ?? "비밀번호를 확인해주세요."}</p>
      ) : helperText ? (
        <p className="text-caption-12-regular text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  )
}

export { PasswordField }
