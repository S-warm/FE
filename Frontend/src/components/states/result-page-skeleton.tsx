import { cn } from "@/lib/utils"

function ResultPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]", className)}
      role="status"
      aria-live="polite"
      aria-label="결과 페이지를 불러오는 중"
    >
      <div
        className="min-h-[520px] animate-pulse rounded-2xl bg-surface-muted"
        aria-hidden="true"
      />
      <div className="grid gap-4">
        <div
          className="h-[88px] animate-pulse rounded-2xl bg-surface-muted"
          aria-hidden="true"
        />
        <div
          className="h-[220px] animate-pulse rounded-2xl bg-surface-muted"
          aria-hidden="true"
        />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[140px] animate-pulse rounded-2xl bg-surface-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { ResultPageSkeleton }
