import { useRef, useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "@/lib/utils"
import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { EmptyState } from "@/components/sections/empty-state"
import type { DonutChartDatumViewModel } from "@/types/view-model/common/chart"

interface DonutChartProps {
  data: DonutChartDatumViewModel[]
  heightClassName?: string
  emptyTitle?: string
  emptyDescription?: string
  total?: number
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
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  count?: number
}) {
  if (!count) return null
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

function DonutChart({
  data,
  heightClassName = "h-[220px]",
  emptyTitle,
  emptyDescription,
  total,
}: DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(220)

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

  return (
    <div ref={containerRef} className={cn(heightClassName, "relative w-full flex items-center justify-center")}>
      {total !== undefined && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[11px] text-text-muted">총 페르소나</p>
            <p className="mt-1 text-[18px] font-bold leading-none text-text-primary">{total.toLocaleString()}명</p>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart style={{ outline: "none" }}>
          <Pie
            data={filteredData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="85%"
            stroke="transparent"
            paddingAngle={3}
            cornerRadius={4}
            isAnimationActive
            animationDuration={450}
            label={renderCustomLabel}
            labelLine={false}
          >
            {filteredData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTooltipContentStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export { DonutChart }
