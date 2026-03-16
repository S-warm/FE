import googleIconUrl from "@/assets/google-icon.svg"
import swarmIconUrl from "@/assets/swarm-icon.svg"

const APP_TITLE = "Swarm"
const APP_TAGLINE = "AI 에이전트 기반 사용자 경험 시뮬레이션"

function BrandingHeader() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3">
        <img src={swarmIconUrl} alt="" aria-hidden className="h-10 w-10 sm:h-12 sm:w-12" />
        <h1 className="text-title-32 text-foreground sm:text-title-42">{APP_TITLE}</h1>
      </div>

      <p className="mt-2 text-body-14-regular text-muted-foreground sm:mt-3 sm:text-body-16-regular">
        {APP_TAGLINE}
      </p>
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

