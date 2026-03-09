import { Sparkles } from "lucide-react"

import { CommonButton, type CommonButtonProps } from "@/components/atoms/common-button"
import { cn } from "@/lib/utils"

export interface SimulationButtonProps extends Omit<CommonButtonProps, "size"> {
  size?: "lg" | "xl"
}

const simulationSizeClassMap: Record<NonNullable<SimulationButtonProps["size"]>, string> = {
  lg: "h-11 rounded-lg px-5 text-base",
  xl: "h-12 rounded-xl px-6 text-base font-semibold",
}

function SimulationButton({
  children = "새 시뮬레이션 시작",
  size = "xl",
  className,
  ...props
}: SimulationButtonProps) {
  return (
    <CommonButton
      size="lg"
      className={cn("gap-2", simulationSizeClassMap[size], className)}
      {...props}
    >
      <Sparkles className="size-4" />
      {children}
    </CommonButton>
  )
}

export { SimulationButton }
