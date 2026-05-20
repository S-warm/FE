import { useRef, useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"

import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/sections/empty-state"
import type { DonutChartDatumViewModel } from "@/types/view-model/common/chart"

interface DonutChartProps {
  data: DonutChartDatumViewModel[]
  heightClassName?: string
  emptyTitle?: string
  emptyDescription?: string
  total?: number
  outerLabels?: boolean
  activeSegmentName?: string | null
  onSegmentClick?: (name: string | null) => void
}

const RADIAN = Math.PI / 180

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  count,
}: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  count?: number
}) {
  if (!count || cx === undefined || cy === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {count}명
    </text>
  )
}

function renderOuterLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  name,
  value,
  count,
  fill,
}: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  name?: string
  value?: number
  count?: number
  fill?: string
}) {
  if (!value || cx === undefined || cy === undefined || midAngle === undefined || innerRadius === undefined || outerRadius === undefined || !name) return null

  const innerR = innerRadius + (outerRadius - innerRadius) * 0.5
  const ix = cx + innerR * Math.cos(-midAngle * RADIAN)
  const iy = cy + innerR * Math.sin(-midAngle * RADIAN)

  const outerR = outerRadius * 1.15
  const rawOx = cx + outerR * Math.cos(-midAngle * RADIAN)
  const rawOy = cy + outerR * Math.sin(-midAngle * RADIAN)

  // 상하로 벗어나는 라벨을 좌우로 당겨옴
  const vertLimit = outerRadius * 1.0
  const finalOy = Math.max(cy - vertLimit, Math.min(cy + vertLimit, rawOy))
  const isConstrained = finalOy !== rawOy
  const hSign = rawOx >= cx ? 1 : -1
  const finalOx = isConstrained
    ? cx + hSign * Math.max(Math.abs(rawOx - cx), outerRadius * 0.75)
    : rawOx

  const isRight = finalOx > cx
  const anchor = isRight ? "start" : "end"
  const rectX = isRight ? finalOx : finalOx - 10
  const textX = isRight ? finalOx + 14 : finalOx - 14
  const oy = finalOy

  return (
    <g>
      <text x={ix} y={iy} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fill="white">
        {value}%
      </text>
      <rect x={rectX} y={oy - 5} width={10} height={10} fill={fill} rx={2} />
      <text x={textX} y={oy} textAnchor={anchor} dominantBaseline="central" fontSize={14} fill="var(--color-text-muted)">
        <tspan fontWeight={500} fill="var(--color-text-body)">{name}</tspan>{" "}({count ?? value}건 / {value}%)
      </text>
    </g>
  )
}


function DonutChart({
  data,
  heightClassName = "h-[220px]",
  emptyTitle,
  emptyDescription,
  total,
  outerLabels = false,
  activeSegmentName,
  onSegmentClick,
}: DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(220)
  const [animationActive, setAnimationActive] = useState(true)
  const [hoverIndex, setHoverIndex] = useState(-1)

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
      <div className={cn(heightClassName, "w-full")}>
        <EmptyState title={emptyTitle} description={emptyDescription} className="h-full" />
      </div>
    )
  }

  const filteredData = data.filter((d) => (d.count ?? d.value) > 0)

  const activeIndex =
    activeSegmentName != null
      ? filteredData.findIndex((d) => d.name === activeSegmentName)
      : -1

  const handleClick = (_: unknown, index: number) => {
    if (!onSegmentClick) return
    const clickedName = filteredData[index]?.name
    onSegmentClick(activeIndex === index ? null : (clickedName ?? null))
  }

  const renderShape = (props: {
    cx: number
    cy: number
    innerRadius: number
    outerRadius: number
    startAngle: number
    endAngle: number
    fill: string
    index: number
    [key: string]: unknown
  }) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props
    const isActive = index === activeIndex
    const isHovered = !isActive && index === hoverIndex
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={isActive ? innerRadius - 2 : innerRadius}
        outerRadius={isActive ? outerRadius + 10 : isHovered ? outerRadius + 4 : outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        heightClassName,
        "relative w-full flex items-center justify-center",
        outerLabels && "px-20 py-8",
        onSegmentClick && "cursor-pointer",
      )}
      style={{ overflow: "visible" }}
    >
      {total !== undefined && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[11px] text-text-muted">총 페르소나</p>
            <p className="mt-1 text-[18px] font-bold leading-none text-text-primary">{total.toLocaleString()}명</p>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height} style={{ overflow: "visible" }}>
        <PieChart style={{ outline: "none", overflow: "visible" }}>
          <Pie
            data={filteredData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius={outerLabels ? "90%" : "88%"}
            stroke="transparent"
            paddingAngle={2}
            cornerRadius={4}
            isAnimationActive={animationActive}
            animationDuration={300}
            onAnimationEnd={() => setAnimationActive(false)}
            label={outerLabels ? renderOuterLabel : renderCustomLabel}
            labelLine={false}
            shape={renderShape}
            onMouseEnter={(_: unknown, index: number) => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(-1)}
            onClick={onSegmentClick ? handleClick : undefined}
          >
            {filteredData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export { DonutChart }
