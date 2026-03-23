import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { ProgressDatum } from "@/mocks/data-visualization.mock"
import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { EmptyState } from "@/components/sections/empty-state"

interface HorizontalBarChartProps {
  data: ProgressDatum[]
  heightClassName?: string
  barColor?: string
  barSize?: number
  emptyTitle?: string
  emptyDescription?: string
}

function HorizontalBarChart({
  data,
  heightClassName = "h-[240px]",
  barColor = "var(--color-primary-main)",
  barSize,
  emptyTitle,
  emptyDescription,
}: HorizontalBarChartProps) {
  if (!data.length) {
    return (
      <div className={`${heightClassName} w-full`}>
        <EmptyState title={emptyTitle} description={emptyDescription} className="h-full" />
      </div>
    )
  }

  return (
    <div className={`${heightClassName} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          barCategoryGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="label"
            width={92}
            tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={chartTooltipContentStyle}
          />
          <Bar
            dataKey="score"
            fill={barColor}
            radius={[8, 8, 8, 8]}
            barSize={barSize}
            isAnimationActive
            animationDuration={450}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { HorizontalBarChart }
