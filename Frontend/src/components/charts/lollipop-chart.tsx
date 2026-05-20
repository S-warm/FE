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

function LollipopShape(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill = "#94a3b8" } = props
  if (width <= 0) return null
  const cy = y + height / 2
  const x2 = x + width
  return (
    <g>
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
  payload,
  label,
  valueFormatter,
}: TooltipProps<number, string> & { valueFormatter?: (v: number) => string }) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value
  const color = payload[0]?.payload?.color

  return (
    <div style={chartTooltipContentStyle} className="rounded-xl px-3 py-2 text-[12px]">
      <p className="mb-1.5 font-semibold">{label}</p>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
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
  domain?: [number, number]
  xAxisTickFormatter?: (v: number) => string
  valueFormatter?: (v: number) => string
  emptyTitle?: string
  emptyDescription?: string
}

function LollipopChart({
  data,
  heightClassName = "h-[240px]",
  domain,
  xAxisTickFormatter,
  valueFormatter,
  emptyTitle,
  emptyDescription,
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
          barCategoryGap={10}
          onMouseMove={(state) => {
            if (state.activeTooltipIndex !== undefined) setActiveIndex(state.activeTooltipIndex)
          }}
          onMouseLeave={() => setActiveIndex(null)}
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
            content={<LollipopTooltip valueFormatter={valueFormatter} />}
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
            barSize={20}
            shape={<LollipopShape />}
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
