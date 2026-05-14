import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"

export interface ResultPageSidePanelItem {
  id: string
  name: string
  screenshotUrl?: string
  metaText?: string
}

function ScreenshotPreview({
  screenshotUrl,
  alt,
}: {
  screenshotUrl?: string
  alt: string
}) {
  const [failedScreenshotUrl, setFailedScreenshotUrl] = useState<string | null>(null)

  if (!screenshotUrl || failedScreenshotUrl === screenshotUrl) {
    return (
      <div className="aspect-[16/10] rounded-xl border border-border-soft bg-surface-subtle flex items-center justify-center">
        <span className="text-caption-12-regular text-text-muted">이미지 로드 불가</span>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-strong bg-card">
      <img
        src={screenshotUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="aspect-[16/10] w-full object-cover"
        onError={() => setFailedScreenshotUrl(screenshotUrl)}
      />
    </div>
  )
}

function ResultPageSidePanel({
  title = "페이지",
  pages,
  selectedPageId,
  expandedPageIds,
  onSelectPage,
  onTogglePage,
  topSlot,
}: {
  title?: string
  pages: ResultPageSidePanelItem[]
  selectedPageId: string
  expandedPageIds: string[]
  onSelectPage: (pageId: string) => void
  onTogglePage: (pageId: string) => void
  topSlot?: React.ReactNode
}) {
  return (
    <Card className={cn("h-fit rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-4 px-4 py-5">
        {topSlot ? <div>{topSlot}</div> : null}

        <div className="grid gap-2">
          <p className="text-caption-12-medium text-text-secondary">{title}</p>
          <div className="grid gap-2">
            {pages.map((page) => {
              const expanded = expandedPageIds.includes(page.id)
              const isSelected = selectedPageId === page.id
              return (
                <div
                  key={page.id}
                  className={cn(
                    "rounded-2xl border transition-colors",
                    isSelected
                      ? "border-border-soft-2 bg-surface-muted hover:bg-surface-muted-hover"
                      : "border-border-soft bg-surface-subtle hover:bg-surface-hover-2",
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors rounded-2xl cursor-pointer",
                      isSelected ? "text-text-strong" : "text-text-secondary hover:text-text-strong",
                    )}
                    onClick={() => onSelectPage(page.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelectPage(page.id)
                      }
                    }}
                  >
                    <span className={cn("truncate text-body-14-medium", isSelected && "font-semibold")}>{page.name}</span>
                    <button
                      type="button"
                      className="ml-auto grid size-8 shrink-0 place-items-center rounded-xl text-text-muted transition-colors hover:bg-surface-hover hover:text-text-strong"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTogglePage(page.id)
                      }}
                      aria-label={expanded ? `${page.name} 접기` : `${page.name} 펼치기`}
                      aria-expanded={expanded}
                    >
                      <ChevronDown className={cn("size-4 transition-transform", expanded ? "rotate-180" : "")} />
                    </button>
                  </div>

                  {expanded ? (
                    <div className="grid gap-2 px-3 pb-3">
                      <ScreenshotPreview screenshotUrl={page.screenshotUrl} alt={page.name} />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { ResultPageSidePanel }
