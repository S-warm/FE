import { cn } from "@/lib/utils"

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-surface-muted", className)}
      aria-hidden="true"
    />
  )
}

function PageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("grid gap-4", className)}
      role="status"
      aria-live="polite"
      aria-label="로딩 중"
    >
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-[116px]" />
        ))}
      </div>
      <SkeletonBlock className="h-[260px]" />
      <div className="grid gap-3 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-[240px]" />
        ))}
      </div>
    </div>
  )
}

export { PageSkeleton }
