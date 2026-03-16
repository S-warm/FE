import { useState } from "react"

import swarmIconUrl from "@/assets/swarm-icon.svg"
import { SimulationButton } from "@/components/atoms"
import { AuthLayout } from "@/layouts/AuthLayout"

const APP_TITLE = "Swarm"
const APP_TAGLINE = "AI 에이전트 기반 사용자 경험 시뮬레이션"

function GeneratePage() {
  const [statusMessage, setStatusMessage] = useState("")

  return (
    <AuthLayout>
      <section className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3">
          <img src={swarmIconUrl} alt="" aria-hidden className="h-14 w-14 sm:h-16 sm:w-16" />
          <h1 className="text-title-32 text-foreground sm:text-title-42">{APP_TITLE}</h1>
        </div>

        <p className="mt-3 text-body-14-regular text-muted-foreground sm:text-body-16-regular">
          {APP_TAGLINE}
        </p>

        <div className="mt-10">
          <SimulationButton
            className="w-full rounded-xl bg-accent text-primary hover:bg-accent/80"
            onClick={() => setStatusMessage("시뮬레이션 실행 플로우는 준비 중입니다.")}
          />
        </div>

        {statusMessage ? (
          <p className="mt-4 text-caption-12-regular text-muted-foreground">{statusMessage}</p>
        ) : null}
      </section>
    </AuthLayout>
  )
}

export default GeneratePage
