import { CheckCircle2, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

interface StepItem {
  id: string
  label: string
  done?: boolean
}

interface StepIndicatorProps {
  steps: StepItem[]
  currentStepId?: string
}

function StepIndicator({ steps, currentStepId }: StepIndicatorProps) {
  return (
    <ol className="grid gap-2">
      {steps.map((step) => {
        const isCurrent = currentStepId === step.id
        const isDone = step.done

        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-body-14-medium",
              isCurrent ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
            )}
          >
            {isDone ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <Circle className="size-4 text-muted-foreground" />
            )}
            <span>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export { StepIndicator }
