import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"
import { EmptyState } from "@/components/sections/empty-state"
import type { DonutChartDatumViewModel } from "@/types/view-model/common/chart"
import { cn } from "@/lib/utils"

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
  const chartData = data.filter((item) => item.value > 0)

  if (!chartData.length) {
    return (
      <div className={cn(heightClassName, "w-full")}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="h-full"
        />
      </div>
    )
  }

  return (
    <div className={cn(heightClassName, "w-full")}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="56%"
            innerRadius="50%"
            outerRadius="92%"
            stroke="transparent"
            paddingAngle={chartData.length > 1 ? 2 : 0}
            isAnimationActive
            animationDuration={450}
          >
            {chartData.map((entry) => (
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
