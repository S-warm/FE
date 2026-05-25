import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { EmptyState } from "@/components/sections/empty-state"
import { useObservedContainerHeight } from "@/hooks"

function getActivePayloadLabel<T extends object>(state: unknown, dataKey: keyof T) {
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
      firstPayload.payload !== null
    ) {
      const value = firstPayload.payload[dataKey as string]
      return typeof value === "string" ? value : null
    }
  }

  return null
}

interface LineTrendChartProps<T extends object> {
  data: T[]
  dataKey: keyof T
  valueKey: keyof T
  heightClassName?: string
  stroke?: string
  domain?: [number, number | "auto"]
  yAxisTickFormatter?: (value: number) => string
  tooltipLabel?: string
  tooltipFormatter?: (value: number) => string
  emptyTitle?: string
  emptyDescription?: string
  highlightedLabel?: string | null
  onLabelClick?: (label: string | null) => void
}

function LineTrendChart<T extends object>({
  data,
  dataKey,
  valueKey,
  heightClassName = "h-[240px]",
  stroke = "var(--color-primary-main)",
  domain = [0, "auto"],
  yAxisTickFormatter,
  tooltipLabel,
  tooltipFormatter,
  emptyTitle,
  emptyDescription,
  highlightedLabel,
  onLabelClick,
}: LineTrendChartProps<T>) {
  const { containerRef, height } = useObservedContainerHeight(240)

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
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          onClick={(state) => {
            const label = getActivePayloadLabel<T>(state, dataKey)
            if (label) onLabelClick?.(highlightedLabel === label ? null : label)
          }}
          style={{ cursor: onLabelClick ? "pointer" : "default" }}
        >
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
            formatter={(value, name) => [
              tooltipFormatter && typeof value === "number" ? tooltipFormatter(value) : value,
              tooltipLabel ?? name,
            ]}
          />
          <Line
            type="monotone"
            dataKey={valueKey as string}
            stroke={stroke}
            strokeWidth={3}
            dot={(dotProps) => {
              const label = dotProps.payload?.[dataKey as string]
              const dotColor = dotProps.payload?.color ?? stroke
              const isHighlighted = !highlightedLabel || highlightedLabel === label
              return (
                <circle
                  key={dotProps.key}
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  r={isHighlighted ? 7 : 5}
                  fill={dotColor}
                  stroke={isHighlighted ? "var(--color-background)" : "none"}
                  strokeWidth={isHighlighted ? 2 : 0}
                  opacity={isHighlighted ? 1 : 0.15}
                  style={{ cursor: onLabelClick ? "pointer" : "default" }}
                  onClick={() => onLabelClick?.(highlightedLabel === label ? null : label)}
                />
              )
            }}
            activeDot={{ r: 6, fill: stroke, stroke: "var(--color-background)", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={380}
            animationEasing="linear"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export { LineTrendChart }
