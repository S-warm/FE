import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { EmptyState } from "@/components/sections/empty-state"
import { useObservedContainerHeight } from "@/hooks"
import type { BarChartDatumViewModel } from "@/types/view-model/common/chart"

function getActiveTooltipIndex(state: unknown) {
  if (
    typeof state === "object" &&
    state !== null &&
    "activeTooltipIndex" in state &&
    typeof state.activeTooltipIndex === "number"
  ) {
    return state.activeTooltipIndex
  }

  return null
}

function getActivePayloadLabel(state: unknown) {
  if (
    typeof state === "object" &&
    state !== null &&
    "activePayload" in state &&
    Array.isArray(state.activePayload)
  ) {
    const firstPayload = state.activePayload[0]
    if (
      typeof firstPayload === "object" &&
      firstPayload !== null &&
      "payload" in firstPayload &&
      typeof firstPayload.payload === "object" &&
      firstPayload.payload !== null &&
      "label" in firstPayload.payload &&
      typeof firstPayload.payload.label === "string"
    ) {
      return firstPayload.payload.label
    }
  }

  return null
}

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
  showValueLabel?: boolean
  valueLabelFormatter?: (v: number) => string
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
  showValueLabel = false,
  valueLabelFormatter,
  emptyTitle,
  emptyDescription,
  highlightedLabel,
  onLabelClick,
}: HorizontalBarChartProps) {
  const { containerRef, height } = useObservedContainerHeight(240)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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
          barCategoryGap="30%"
          onMouseMove={(state) => {
            setActiveIndex(getActiveTooltipIndex(state))
          }}
          onMouseLeave={() => setActiveIndex(null)}
          onClick={(state) => {
            const label = getActivePayloadLabel(state)
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
            width={46}
            tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
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
            barSize={barSize ?? 24}
            isAnimationActive
            animationDuration={360}
            animationEasing="linear"
            onClick={(_, index) => {
              const label = data[index]?.label
              if (label) {
                onLabelClick?.(highlightedLabel === label ? null : label)
              }
            }}
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
            {showValueLabel && (
              <LabelList
                dataKey="score"
                position="center"
                content={(props) => {
                  const { x = 0, y = 0, width: w = 0, height: h = 0, value, index = 0 } = props as { x?: number; y?: number; width?: number; height?: number; value?: number; index?: number }
                  if (!value || (w as number) < 30) return null
                  const entry = data[index]
                  const dimmed = !!highlightedLabel && highlightedLabel !== entry?.label
                  const fill = entry?.color ?? barColor
                  const isLight = (() => {
                    const hex = fill.replace("#", "")
                    if (hex.length !== 6) return false
                    const r = parseInt(hex.slice(0, 2), 16)
                    const g = parseInt(hex.slice(2, 4), 16)
                    const b = parseInt(hex.slice(4, 6), 16)
                    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
                  })()
                  return (
                    <text
                      x={(x as number) + (w as number) / 2}
                      y={(y as number) + (h as number) / 2}
                      dy={4}
                      textAnchor="middle"
                      fill={isLight ? "rgba(0,0,0,0.7)" : "#ffffff"}
                      fontSize={11}
                      fontWeight={600}
                      opacity={dimmed ? 0 : 1}
                    >
                      {valueLabelFormatter ? valueLabelFormatter(value) : value}
                    </text>
                  )
                }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { HorizontalBarChart }
