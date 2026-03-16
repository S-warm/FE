import googleIconUrl from "@/assets/google-icon.svg"
import swarmIconUrl from "@/assets/swarm-icon.svg"
import { cn } from "@/lib/utils"

const APP_TITLE = "Swarm"
const APP_TAGLINE = "AI 에이전트 기반 사용자 경험 시뮬레이션"

function BrandingHeader({
  compact = false,
  showTagline = true,
  align = "center",
  className,
}: {
  compact?: boolean
  showTagline?: boolean
  align?: "center" | "left"
  className?: string
}) {
  return (
    <div className={cn(align === "left" ? "text-left" : "text-center", className)}>
      <div className={cn("flex items-center gap-3", align === "left" ? "justify-start" : "justify-center")}>
        <img
          src={swarmIconUrl}
          alt=""
          aria-hidden
          className={cn(compact ? "h-7 w-7" : "h-10 w-10 sm:h-12 sm:w-12")}
        />
        <h1
          className={cn(
            compact ? "text-subtitle-20-bold text-foreground" : "text-title-32 text-foreground sm:text-title-42"
          )}
        >
          {APP_TITLE}
        </h1>
      </div>

      {showTagline ? (
        <p className="mt-2 text-body-14-regular text-muted-foreground sm:mt-3 sm:text-body-16-regular">
          {APP_TAGLINE}
        </p>
      ) : null}
    </div>
  )
}

function GoogleStartButton() {
  return (
    <span className="inline-flex items-center gap-2">
      <img src={googleIconUrl} alt="" aria-hidden className="h-4 w-4" />
      Google로 시작하기
    </span>
  )
}

export { BrandingHeader, GoogleStartButton }

