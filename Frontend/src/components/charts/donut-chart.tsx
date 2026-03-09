import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { DonutDatum } from "@/mocks/data-visualization.mock"

interface DonutChartProps {
  data: DonutDatum[]
}

function DonutChart({ data }: DonutChartProps) {
  return (
    <div className="h-[220px] w-full">
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
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-background)",
              color: "var(--color-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export { DonutChart }
