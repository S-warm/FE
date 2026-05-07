import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { EmptyState } from "@/components/sections/empty-state"

interface LineTrendChartProps<T extends object> {
  data: T[]
  dataKey: keyof T
  valueKey: keyof T
  heightClassName?: string
  stroke?: string
  domain?: [number, number | "auto"]
  yAxisTickFormatter?: (value: number) => string
  tooltipFormatter?: (value: number) => string
  emptyTitle?: string
  emptyDescription?: string
}

function LineTrendChart<T extends object>({
  data,
  dataKey,
  valueKey,
  heightClassName = "h-[240px]",
  stroke = "var(--color-primary-main)",
  domain = [0, "auto"],
  yAxisTickFormatter,
  tooltipFormatter,
  emptyTitle,
  emptyDescription,
}: LineTrendChartProps<T>) {
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
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey={dataKey as string}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={domain}
            tickFormatter={yAxisTickFormatter}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={chartTooltipContentStyle}
            formatter={(value) =>
              tooltipFormatter && typeof value === "number" ? tooltipFormatter(value) : value
            }
          />
          <Line
            type="monotone"
            dataKey={valueKey as string}
            stroke={stroke}
            strokeWidth={3}
            dot={{ r: 4, fill: stroke, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: stroke, stroke: "var(--color-background)", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={450}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export { LineTrendChart }
