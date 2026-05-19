import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface ResultPageSidePanelItem {
  id: string
  name: string
  url?: string
  screenshotUrl?: string
  metaText?: string
}

function getDisplayPath(url: string): string {
  try {
    const pathname = new URL(url).pathname
    return decodeURIComponent(pathname)
  } catch {
    try {
      return decodeURIComponent(url)
    } catch {
      return url
    }
  }
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
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-border-soft bg-surface-subtle">
        <span className="text-caption-12-regular text-text-muted">
          이미지를 불러올 수 없습니다
        </span>
      </div>
    )
  }

  return (
    <div className="aspect-[16/10] overflow-hidden rounded-xl border border-border-soft">
      <img
        src={screenshotUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
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
    <Card
      className={cn(
        "min-h-full rounded-2xl border-none bg-surface-app shadow-none",
        motion.card,
      )}
    >
      <CardContent className="grid gap-3 px-3 py-4">
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
                      ? "border-border-soft-3 bg-card shadow-sm"
                      : "border-border-soft bg-card hover:bg-surface-hover-2",
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-3 text-left transition-colors",
                      isSelected
                        ? "text-text-strong"
                        : "text-text-secondary hover:text-text-strong",
                    )}
                    onClick={() => onSelectPage(page.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        onSelectPage(page.id)
                      }
                    }}
                  >
                    <span className="min-w-0 flex flex-col">
                      <span
                        className={cn(
                          "truncate text-[16px] font-semibold",
                          isSelected ? "text-text-strong" : "text-text-body",
                        )}
                      >
                        {page.url ? getDisplayPath(page.url) : page.name}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="ml-auto grid size-8 shrink-0 place-items-center rounded-xl text-text-muted transition-colors hover:bg-surface-hover hover:text-text-strong"
                      onClick={(event) => {
                        event.stopPropagation()
                        onTogglePage(page.id)
                      }}
                      aria-label={
                        expanded ? `${page.name} 접기` : `${page.name} 펼치기`
                      }
                      aria-expanded={expanded}
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          expanded ? "rotate-180" : "",
                        )}
                      />
                    </button>
                  </div>

                  {expanded ? (
                    <div className="grid gap-2 px-3 pb-3">
                      <ScreenshotPreview
                        screenshotUrl={page.screenshotUrl}
                        alt={page.name}
                      />
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
