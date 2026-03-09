import { DonutChart } from "@/components/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DonutDatum } from "@/mocks/data-visualization.mock"

interface SummaryPanelProps {
  score: number
  distribution: DonutDatum[]
}

function SummaryPanel({ score, distribution }: SummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>요약 패널</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
        <div className="flex flex-col items-center justify-center rounded-xl bg-muted/40 p-4">
          <p className="text-caption-12-medium text-muted-foreground">전체 점수</p>
          <p className="text-title-42">{score}</p>
          <p className="text-caption-12-regular text-muted-foreground">/ 100</p>
        </div>

        <div className="grid gap-3">
          <DonutChart data={distribution} />
          <div className="flex flex-wrap gap-2">
            {distribution.map((item) => (
              <div key={item.name} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="text-caption-12-medium text-foreground">
                  {item.name} {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { SummaryPanel }
