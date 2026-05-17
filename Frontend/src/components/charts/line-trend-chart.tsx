import { useRef, useEffect, useState } from "react"
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(240)

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setHeight(Math.max(200, Math.round(rect.height)))
      }
    }

    const timer = setTimeout(updateHeight, 0)
    const resizeObserver = new ResizeObserver(updateHeight)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [])

  if (!data.length) {
    return (
      <div className={`${heightClassName} w-full`}>
        <EmptyState title={emptyTitle} description={emptyDescription} className="h-full" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`${heightClassName} w-full flex items-center justify-center`}>
      <ResponsiveContainer width="100%" height={height}>
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
