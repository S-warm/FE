import { Link } from "react-router-dom"

import googleIconUrl from "@/assets/icons/ic-google.svg"
import swarmIconUrl from "@/assets/logos/logo-swarm.svg"
import routes from "@/constants/routes"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const homePath = isAuthenticated ? routes.generate : routes.home

  return (
    <div className={cn(align === "left" ? "text-left" : "text-center", className)}>
      <Link
        to={homePath}
        aria-label="메인 화면으로 이동"
        className={cn(
          "inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          align === "left" ? "justify-start" : "justify-center"
        )}
      >
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
      </Link>

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
