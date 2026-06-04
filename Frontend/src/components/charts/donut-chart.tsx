import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"
import type { PieSectorShapeProps } from "recharts/types/polar/Pie"

import { cn } from "@/lib/utils"
import { useObservedContainerHeight } from "@/hooks"
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
      {count}건
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
      <text x={textX} y={oy} textAnchor={anchor} dominantBaseline="central" fontSize={12} fill="var(--color-text-muted)">
        <tspan fontWeight={500} fill="var(--color-text-body)">{name}</tspan>
        <tspan fontSize={11}> ({count ?? value}건)</tspan>
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
  const { containerRef, height } = useObservedContainerHeight(220)
  const [animationActive, setAnimationActive] = useState(true)
  const [hoverIndex, setHoverIndex] = useState(-1)

  // 데이터 변경 시 애니메이션 재실행
  useEffect(() => {
    setAnimationActive(true)
  }, [data])

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

  const renderShape = (props: PieSectorShapeProps) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    const index = typeof props.payload?.index === "number"
      ? props.payload.index
      : typeof props.index === "number"
        ? props.index
        : -1
    const safeCx = typeof cx === "number" ? cx : 0
    const safeCy = typeof cy === "number" ? cy : 0
    const safeInnerRadius = typeof innerRadius === "number" ? innerRadius : 0
    const safeOuterRadius = typeof outerRadius === "number" ? outerRadius : 0
    const safeStartAngle = typeof startAngle === "number" ? startAngle : 0
    const safeEndAngle = typeof endAngle === "number" ? endAngle : 0
    const isActive = index === activeIndex
    const isHovered = !isActive && index === hoverIndex
    return (
      <Sector
        cx={safeCx}
        cy={safeCy}
        innerRadius={isActive ? safeInnerRadius - 2 : safeInnerRadius}
        outerRadius={isActive ? safeOuterRadius + 10 : isHovered ? safeOuterRadius + 4 : safeOuterRadius}
        startAngle={safeStartAngle}
        endAngle={safeEndAngle}
        fill={fill ?? "currentColor"}
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
            <p className="mt-1 text-[18px] font-bold leading-none text-text-primary">{total.toLocaleString()}건</p>
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
            animationDuration={600}
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
