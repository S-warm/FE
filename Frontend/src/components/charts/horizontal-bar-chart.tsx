import { useRef, useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type XAxisProps } from "recharts"

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
  domain?: [number, number]
  ticks?: number[]
  gaugeTicks?: number[]
  xAxisTickFormatter?: (v: number) => string
  tooltipLabel?: string
  tooltipFormatter?: (v: number) => string
  emptyTitle?: string
  emptyDescription?: string
  highlightedLabel?: string | null
  onLabelClick?: (label: string | null) => void
}

function HorizontalBarChart({
  data,
  heightClassName = "h-[240px]",
  barColor = "var(--color-primary-main)",
  mutedBarColor = "var(--color-primary-100)",
  barSize,
  highlightMode = "none",
  domain,
  ticks,
  gaugeTicks,
  xAxisTickFormatter,
  tooltipLabel,
  tooltipFormatter,
  emptyTitle,
  emptyDescription,
  highlightedLabel,
  onLabelClick,
}: HorizontalBarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(240)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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

  const activeScore = activeIndex !== null ? data[activeIndex]?.score : null

  return (
    <div ref={containerRef} className={`${heightClassName} w-full flex items-center justify-center`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          barCategoryGap={10}
          onMouseMove={(state) => {
            if (state.activeTooltipIndex !== undefined) setActiveIndex(state.activeTooltipIndex)
          }}
          onMouseLeave={() => setActiveIndex(null)}
          onClick={(state) => {
            const label = state?.activePayload?.[0]?.payload?.label
            if (label) onLabelClick?.(highlightedLabel === label ? null : label)
          }}
          style={{ cursor: onLabelClick ? "pointer" : "default" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            type="number"
            domain={domain ?? [0, 100]}
            ticks={ticks}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, opacity: 0.6 }}
            tickFormatter={xAxisTickFormatter}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={92}
            tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={chartTooltipContentStyle}
            formatter={(value, name) => [
              tooltipFormatter && typeof value === "number" ? tooltipFormatter(value) : value,
              tooltipLabel ?? name,
            ]}
          />
          {(gaugeTicks ?? []).map((tick) => (
            <ReferenceLine
              key={tick}
              x={tick}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1.5}
            />
          ))}
          {activeScore !== null && (
            <ReferenceLine
              x={activeScore}
              stroke="var(--color-primary-main)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}
          <Bar
            dataKey="score"
            fill={barColor}
            radius={[8, 8, 8, 8]}
            barSize={barSize}
            isAnimationActive
            animationDuration={450}
            onClick={(barData: BarChartDatumViewModel) => onLabelClick?.(highlightedLabel === barData.label ? null : barData.label)}
            style={{ cursor: onLabelClick ? "pointer" : "default" }}
          >
            {data.map((entry, index) => {
              const isHighlighted = targetScore !== null && entry.score === targetScore
              const fill = entry.color ?? (isHighlighted ? barColor : mutedBarColor)

              return (
                <Cell
                  key={`${entry.label}-${index}`}
                  fill={fill}
                  opacity={highlightedLabel && highlightedLabel !== entry.label ? 0.12 : 1}
                stroke={highlightedLabel === entry.label ? "rgba(255,255,255,0.4)" : "none"}
                strokeWidth={highlightedLabel === entry.label ? 1.5 : 0}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { HorizontalBarChart }
