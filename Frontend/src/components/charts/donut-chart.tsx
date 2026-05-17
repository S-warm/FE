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
}

function DonutChart({
  data,
  heightClassName = "h-[220px]",
  emptyTitle,
  emptyDescription,
}: DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(220)

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        // Ensure minimum height of 200px
        setHeight(Math.max(200, Math.round(rect.height)))
      }
    }

    // Initial measurement
    const timer = setTimeout(updateHeight, 0)

    // Add resize observer
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

  return (
    <div ref={containerRef} className={cn(heightClassName, "w-full flex items-center justify-center")}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="56%"
            innerRadius="50%"
            outerRadius="92%"
            stroke="transparent"
            paddingAngle={2}
            isAnimationActive
            animationDuration={450}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={chartTooltipContentStyle}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export { DonutChart }
