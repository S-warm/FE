import { useState } from "react"

import { HorizontalBarChart, HeatmapGrid } from "@/components/charts"
import { HeaderBar, Sidebar, TabMenu } from "@/components/layout"
import { IssueCard, SummaryPanel } from "@/components/sections"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { donutData, heatmapData, issueData, progressData, summaryScore } from "@/mocks/data-visualization.mock"

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
            <CardContent className="p-0">
              <TabMenu value={tab} onChange={setTab} />
            </CardContent>
          </Card>

          <SummaryPanel score={summaryScore} distribution={donutData} />

          <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
            <Card>
              <CardHeader>
                <CardTitle>진행도 차트</CardTitle>
              </CardHeader>
              <CardContent>
                <HorizontalBarChart data={progressData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>히트맵 그리드</CardTitle>
              </CardHeader>
              <CardContent>
                <HeatmapGrid data={heatmapData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {issueData.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
