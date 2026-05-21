import { useEffect, useRef, useState } from "react"
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"

import { EmptyState } from "@/components/sections/empty-state"
import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import type { BarChartDatumViewModel } from "@/types/view-model/common/chart"

type LollipopTooltipPayload = {
  color?: string
}

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

function LollipopShape(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  opacity?: number
  onClick?: React.MouseEventHandler<SVGElement>
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill = "#94a3b8", opacity = 1, onClick } = props
  if (width <= 0) return null
  const cy = y + height / 2
  const x2 = x + width
  return (
    <g onClick={onClick} opacity={opacity} style={{ cursor: onClick ? "pointer" : "default" }}>
      <rect x={x} y={y} width={width} height={height} fill="transparent" />
      <line
        x1={x}
        y1={cy}
        x2={x2}
        y2={cy}
        stroke={fill}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.5}
      />
      <circle cx={x2} cy={cy} r={7} fill={fill} />
    </g>
  )
}

function LollipopTooltip({
  active,
  valueLabel,
  valueFormatter,
}: TooltipProps<number, string> & { valueLabel?: string; valueFormatter?: (v: number) => string }) {
  const payload = (arguments[0].payload ?? []) as Array<{
    value?: number
    payload?: LollipopTooltipPayload
  }>
  const label = typeof arguments[0].label === "string" ? arguments[0].label : ""
  if (!active || !payload?.length) return null
  const value = payload[0]?.value
  const color = payload[0]?.payload?.color

  return (
    <div style={chartTooltipContentStyle} className="rounded-xl px-3 py-2 text-[12px]">
      <p className="mb-1.5 font-semibold">{label}</p>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
        {valueLabel && <span className="text-text-muted">{valueLabel}</span>}
        <span className="font-medium">
          {typeof value === "number" ? (valueFormatter ? valueFormatter(value) : value) : "-"}
        </span>
      </div>
    </div>
  )
}

interface LollipopChartProps {
  data: BarChartDatumViewModel[]
  heightClassName?: string
  barSize?: number
  domain?: [number, number]
  xAxisTickFormatter?: (v: number) => string
  valueLabel?: string
  valueFormatter?: (v: number) => string
  emptyTitle?: string
  emptyDescription?: string
  highlightedLabel?: string | null
  onLabelClick?: (label: string | null) => void
}

function LollipopChart({
  data,
  heightClassName = "h-[240px]",
  barSize,
  domain,
  xAxisTickFormatter,
  valueLabel,
  valueFormatter,
  emptyTitle,
  emptyDescription,
  highlightedLabel,
  onLabelClick,
}: LollipopChartProps) {
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
    if (containerRef.current) resizeObserver.observe(containerRef.current)

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

  const maxScore = Math.max(...data.map((d) => d.score))
  const resolvedDomain = domain ?? ([0, Number((maxScore * 1.2).toFixed(1))] as [number, number])
  const activeScore = activeIndex !== null ? data[activeIndex]?.score : null

  return (
    <div ref={containerRef} className={`${heightClassName} w-full flex items-center justify-center`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis
            type="number"
            domain={resolvedDomain}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
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
            content={<LollipopTooltip valueLabel={valueLabel} valueFormatter={valueFormatter} />}
            cursor={false}
          />
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
            barSize={barSize ?? 24}
            shape={(shapeProps: { x?: number; y?: number; width?: number; height?: number; fill?: string; payload?: { label?: string } }) => {
              const label = typeof shapeProps.payload?.label === "string" ? shapeProps.payload.label : null
              return (
                <LollipopShape
                  {...shapeProps}
                  opacity={highlightedLabel && highlightedLabel !== label ? 0.12 : 1}
                  onClick={() => onLabelClick?.(highlightedLabel === label ? null : label)}
                />
              )
            }}
            isAnimationActive
            animationDuration={450}
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.label}-${index}`} fill={entry.color ?? "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { LollipopChart }
