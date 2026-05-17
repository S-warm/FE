import { useRef, useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { EmptyState } from "@/components/sections/empty-state"
import type { BarChartDatumViewModel } from "@/types/view-model/common/chart"

interface HorizontalBarChartProps {
  data: BarChartDatumViewModel[]
  heightClassName?: string
  barColor?: string
  mutedBarColor?: string
  barSize?: number
  highlightMode?: "none" | "min" | "max"
  emptyTitle?: string
  emptyDescription?: string
}

function HorizontalBarChart({
  data,
  heightClassName = "h-[240px]",
  barColor = "var(--color-primary-main)",
  mutedBarColor = "var(--color-primary-100)",
  barSize,
  highlightMode = "none",
  emptyTitle,
  emptyDescription,
}: HorizontalBarChartProps) {
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

  const targetScore =
    highlightMode === "none"
      ? null
      : highlightMode === "min"
        ? Math.min(...data.map((item) => item.score))
        : Math.max(...data.map((item) => item.score))

  return (
    <div ref={containerRef} className={`${heightClassName} w-full flex items-center justify-center`}>
      <ResponsiveContainer width="100%" height={height}>
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
          >
            {data.map((entry, index) => {
              const isHighlighted = targetScore !== null && entry.score === targetScore
              const fill = entry.color ?? (isHighlighted ? barColor : mutedBarColor)

              return <Cell key={`${entry.label}-${index}`} fill={fill} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { HorizontalBarChart }
