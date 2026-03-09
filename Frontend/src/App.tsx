import { useState } from "react"

import { HeaderBar, Sidebar, StepIndicator, TabMenu } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RESPONSIVE_BREAKPOINTS, RESPONSIVE_GUIDE } from "@/constants/responsive"

const flowSteps = [
  { id: "step-1", label: "A-Mall 로그인 접근", done: true },
  { id: "step-2", label: "로그인 폼 입력", done: true },
  { id: "step-3", label: "오류 메시지 확인", done: false },
  { id: "step-4", label: "로그인 성공 후 이동", done: false },
]

function App() {
  const [tab, setTab] = useState("overview")

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground font-sans">
      <section className="mx-auto grid w-full max-w-[1400px] gap-4 xl:grid-cols-[260px_1fr]">
        <div className="order-2 xl:order-1">
          <Sidebar />
        </div>

        <div className="order-1 grid gap-4 xl:order-2">
          <HeaderBar />

          <Card>
            <CardContent className="py-3">
              <p className="text-caption-12-regular text-muted-foreground">
                반응형 기준: {RESPONSIVE_GUIDE[0]} / {RESPONSIVE_GUIDE[1]} / {RESPONSIVE_GUIDE[2]}
              </p>
              <p className="mt-1 text-caption-12-regular text-muted-foreground">
                px 기준: mobile ≤ {RESPONSIVE_BREAKPOINTS.mobileMax}, tablet ≥{" "}
                {RESPONSIVE_BREAKPOINTS.tabletMin}, desktop ≥ {RESPONSIVE_BREAKPOINTS.desktopMin}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <TabMenu value={tab} onChange={setTab} />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Step Indicator</CardTitle>
              </CardHeader>
              <CardContent>
                <StepIndicator steps={flowSteps} currentStepId="step-3" />
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>요약 패널 (빈 데이터)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-body-14-regular text-muted-foreground">
                      점수 데이터 없음
                    </div>
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-body-14-regular text-muted-foreground">
                      카테고리 분포 없음
                    </div>
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-body-14-regular text-muted-foreground">
                      최근 이슈 없음
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tab === "overview" ? "개요 영역" : "콘텐츠 영역"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-body-14-regular text-muted-foreground">
                    빈 상태에서도 페이지 골격이 유지되도록 구성된 영역입니다.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
