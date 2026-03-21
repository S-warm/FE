import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "@/lib/utils"
import type { DonutDatum } from "@/mocks/data-visualization.mock"
import { chartTooltipContentStyle } from "@/components/charts/chart-tooltip"

interface DonutChartProps {
  data: DonutDatum[]
  heightClassName?: string
}

function DonutChart({ data, heightClassName = "h-[220px]" }: DonutChartProps) {
  return (
    <div className={cn(heightClassName, "w-full")}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={80}
            stroke="transparent"
            paddingAngle={2}
            isAnimationActive={false}
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
