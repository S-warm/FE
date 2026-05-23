import { useEffect, useMemo, useState } from "react"
import type { ReactElement } from "react"
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

import { EmptyState } from "@/components/sections/empty-state"
import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { useObservedContainerHeight } from "@/hooks"

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

type StackedTooltipEntry = {
  dataKey?: string
  value?: number | string
  payload?: {
    successColor?: string
    failureColor?: string
  }
}

type LabelContentProps = {
  x?: number | string
  y?: number | string
  width?: number | string
  height?: number | string
  value?: number | string | boolean | null
  index?: number
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

function toNumber(value?: number | string | boolean | null) {
  return typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0
}

function StackedTooltip(props: {
  active?: boolean
  payload?: StackedTooltipEntry[]
  label?: string | number
}) {
  const active = props.active
  const payload = props.payload ?? []
  const label = typeof props.label === "string" || typeof props.label === "number"
    ? String(props.label)
    : ""
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
  const { containerRef, height } = useObservedContainerHeight(280)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isAnimationActive, setIsAnimationActive] = useState(true)

  if (!data.length) {
    return (
      <div className={`${heightClassName} w-full`}>
        <EmptyState title={emptyTitle} description={emptyDescription} className="h-full" />
      </div>
    )
  }

  const chartDataKey = useMemo(
    () =>
      data
        .map((entry) => `${entry.label}:${entry.success}:${entry.failure}`)
        .join("|"),
    [data],
  )

  useEffect(() => {
    setIsAnimationActive(true)
  }, [chartDataKey])

  const activeSuccess = activeIndex !== null ? data[activeIndex]?.success : null

  const renderSuccessLabel = (props: LabelContentProps) => {
    const x = toNumber(props.x)
    const y = toNumber(props.y)
    const w = toNumber(props.width)
    const h = toNumber(props.height)
    const value = toNumber(props.value)
    const index = props.index ?? 0
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

  const renderFailureLabel = (props: LabelContentProps) => {
    const x = toNumber(props.x)
    const y = toNumber(props.y)
    const w = toNumber(props.width)
    const h = toNumber(props.height)
    const value = toNumber(props.value)
    const index = props.index ?? 0
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
            setActiveIndex(getActiveTooltipIndex(state))
          }}
          onMouseLeave={() => setActiveIndex(null)}
          onClick={(state) => {
            const label = getActivePayloadLabel(state)
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
            isAnimationActive={isAnimationActive}
            animationDuration={420}
            animationEasing="linear"
            onAnimationEnd={() => { setIsAnimationActive(false) }}
            onClick={(_, index) => {
              const label = data[index]?.label
              if (label) {
                onLabelClick?.(highlightedLabel === label ? null : label)
              }
            }}
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
            {!isAnimationActive ? (
              <LabelList dataKey="success" content={renderSuccessLabel as (props: unknown) => ReactElement | null} />
            ) : null}
          </Bar>
          <Bar
            dataKey="failure"
            stackId="a"
            name="실패"
            barSize={barSize ?? 24}
            radius={[0, 8, 8, 0]}
            isAnimationActive={isAnimationActive}
            animationDuration={420}
            animationEasing="linear"
            onClick={(_, index) => {
              const label = data[index]?.label
              if (label) {
                onLabelClick?.(highlightedLabel === label ? null : label)
              }
            }}
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
            {!isAnimationActive ? (
              <LabelList dataKey="failure" content={renderFailureLabel as (props: unknown) => ReactElement | null} />
            ) : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { StackedBarChart }
