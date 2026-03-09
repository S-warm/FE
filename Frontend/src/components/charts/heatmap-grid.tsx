import { cn } from "@/lib/utils"
import type { HeatmapCell } from "@/mocks/data-visualization.mock"

interface HeatmapGridProps {
  data: HeatmapCell[]
  columns?: number
}

function resolveHeatLevel(value: number) {
  if (value >= 80) return "bg-primary"
  if (value >= 60) return "bg-primary/80"
  if (value >= 40) return "bg-primary/60"
  if (value >= 20) return "bg-primary/40"
  return "bg-primary/20"
}

function HeatmapGrid({ data, columns = 8 }: HeatmapGridProps) {
  return (
    <div
      className="grid gap-1.5"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {data.map((cell) => (
        <div
          key={cell.id}
          title={`${cell.value}%`}
          className={cn("aspect-square rounded-[6px]", resolveHeatLevel(cell.value))}
        />
      ))}
    </div>
  )
}

export { HeatmapGrid }
