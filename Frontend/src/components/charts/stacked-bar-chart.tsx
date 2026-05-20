import { useEffect, useRef, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"

import { EmptyState } from "@/components/sections/empty-state"
import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"

export interface StackedBarDatumViewModel {
  label: string
  success: number
  failure: number
  successColor: string
  failureColor: string
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
}

function StackedTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  const success = payload.find((p) => p.dataKey === "success")
  const failure = payload.find((p) => p.dataKey === "failure")

  return (
    <div style={chartTooltipContentStyle} className="rounded-xl px-3 py-2 text-[12px]">
      <p className="mb-1.5 font-semibold">{label}</p>
      {success && (
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: success.payload?.successColor }} />
          <span className="text-text-muted">성공</span>
          <span className="ml-auto font-medium">{success.value}%</span>
        </div>
      )}
      {failure && (
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: failure.payload?.failureColor }} />
          <span className="text-text-muted">실패</span>
          <span className="ml-auto font-medium">{failure.value}%</span>
        </div>
      )}
    </div>
  )
}

interface StackedBarChartProps {
  data: StackedBarDatumViewModel[]
  heightClassName?: string
  barSize?: number
  emptyTitle?: string
  emptyDescription?: string
  highlightedLabel?: string | null
  onLabelClick?: (label: string | null) => void
}

function StackedBarChart({
  data,
  heightClassName = "h-[280px]",
  barSize,
  emptyTitle,
  emptyDescription,
  highlightedLabel,
  onLabelClick,
}: StackedBarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(280)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const animatedRef = useRef(true)

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

  const activeSuccess = activeIndex !== null ? data[activeIndex]?.success : null

  const renderSuccessLabel = (props: { x?: number; y?: number; width?: number; height?: number; value?: number; index?: number }) => {
    const { x = 0, y = 0, width: w = 0, height: h = 0, value = 0, index = 0 } = props
    if (value < 10) return null
    const entry = data[index]
    if (!entry) return null
    const dimmed = !!highlightedLabel && highlightedLabel !== entry.label
    const textColor = isLightColor(entry.successColor) ? "rgba(0,0,0,0.7)" : "#ffffff"
    return (
      <text x={x + w / 2} y={y + h / 2} dy={4} textAnchor="middle" fill={textColor} fontSize={11} fontWeight={600} opacity={dimmed ? 0 : 1}>
        {`${value}%`}
      </text>
    )
  }

  const renderFailureLabel = (props: { x?: number; y?: number; width?: number; height?: number; value?: number; index?: number }) => {
    const { x = 0, y = 0, width: w = 0, height: h = 0, value = 0, index = 0 } = props
    if (value <= 0) return null
    const entry = data[index]
    if (!entry) return null
    const dimmed = !!highlightedLabel && highlightedLabel !== entry.label
    const textColor = isLightColor(entry.failureColor) ? "rgba(0,0,0,0.7)" : "#ffffff"
    return (
      <text x={x + w / 2} y={y + h / 2} dy={4} textAnchor="middle" fill={textColor} fontSize={10} fontWeight={600} opacity={dimmed ? 0 : 1}>
        {`${value}%`}
      </text>
    )
  }

  return (
    <div ref={containerRef} className={`${heightClassName} w-full flex items-center justify-center`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          barCategoryGap="60%"
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
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            horizontal={false}
            vertical={true}
            opacity={0.4}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, opacity: 0.6 }}
            tickFormatter={(v) => `${v}%`}
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
          <Tooltip content={<StackedTooltip />} cursor={{ fill: "var(--color-border)", opacity: 0.3 }} />
          {activeSuccess !== null && activeSuccess > 0 && activeSuccess < 100 && (
            <ReferenceLine
              x={activeSuccess}
              stroke="var(--color-primary-main)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}
          <Bar
            dataKey="success"
            stackId="a"
            name="성공"
            barSize={barSize ?? 24}
            radius={[8, 0, 0, 8]}
            isAnimationActive={animatedRef.current}
            animationDuration={450}
            onAnimationEnd={() => { animatedRef.current = false }}
            onClick={(barData: StackedBarDatumViewModel) => onLabelClick?.(highlightedLabel === barData.label ? null : barData.label)}
            style={{ cursor: onLabelClick ? "pointer" : "default" }}
            background={(bgProps: { x?: number; y?: number; width?: number; height?: number; index?: number }) => {
              const { x = 0, y = 0, width = 0, height = 0, index = 0 } = bgProps
              if (index % 2 !== 0) return <rect key={index} width={0} height={0} />
              return (
                <rect
                  key={index}
                  x={x}
                  y={y - 8}
                  width={width}
                  height={height + 16}
                  fill="rgba(0,0,0,0.03)"
                  rx={6}
                />
              )
            }}
          >
            {data.map((entry) => (
              <Cell
                key={`success-${entry.label}`}
                fill={entry.successColor}
                opacity={highlightedLabel && highlightedLabel !== entry.label ? 0.12 : 1}
                stroke={highlightedLabel === entry.label ? "rgba(255,255,255,0.4)" : "none"}
                strokeWidth={highlightedLabel === entry.label ? 1.5 : 0}
              />
            ))}
            <LabelList dataKey="success" content={renderSuccessLabel} />
          </Bar>
          <Bar
            dataKey="failure"
            stackId="a"
            name="실패"
            barSize={barSize ?? 24}
            radius={[0, 8, 8, 0]}
            isAnimationActive={animatedRef.current}
            animationDuration={450}
            onClick={(barData: StackedBarDatumViewModel) => onLabelClick?.(highlightedLabel === barData.label ? null : barData.label)}
            style={{ cursor: onLabelClick ? "pointer" : "default" }}
          >
            {data.map((entry) => (
              <Cell
                key={`failure-${entry.label}`}
                fill={entry.failureColor}
                opacity={highlightedLabel && highlightedLabel !== entry.label ? 0.12 : 1}
                stroke={highlightedLabel === entry.label ? "rgba(255,255,255,0.4)" : "none"}
                strokeWidth={highlightedLabel === entry.label ? 1.5 : 0}
              />
            ))}
            <LabelList dataKey="failure" content={renderFailureLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { StackedBarChart }
