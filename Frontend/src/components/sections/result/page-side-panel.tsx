import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface ResultPageSidePanelItem {
  id: string
  name: string
  url?: string
  previewUrl?: string
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
  previewUrl,
  alt,
}: {
  previewUrl?: string
  alt: string
}) {
  const [failed, setFailed] = useState(false)

  if (!previewUrl || failed) {
    return (
      <div className="flex h-[140px] items-center justify-center rounded-xl border border-border-soft bg-surface-subtle px-4">
        <span className="text-center text-caption-12-regular text-text-muted">
          이미지를 불러올 수 없습니다
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-[140px] items-center justify-center overflow-hidden rounded-xl border border-border-soft bg-white">
      <img
        src={previewUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        referrerPolicy="no-referrer"
        className="h-full w-full object-contain object-top"
        onError={() => setFailed(true)}
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
        "min-w-0 rounded-2xl border-none bg-surface-app shadow-none py-0 gap-0 h-full min-h-0 flex flex-col",
        motion.card,
      )}
    >
      <CardContent className="grid gap-2 px-3 py-3">
        {topSlot ? <div>{topSlot}</div> : null}

        <div className="grid min-w-0 gap-2">
          <p className="text-caption-12-medium text-text-secondary">{title}</p>
          <div className="grid min-w-0 gap-2">
            {pages.map((page) => {
              const expanded = expandedPageIds.includes(page.id)
              const isSelected = selectedPageId === page.id

              return (
                <div
                  key={page.id}
                  className={cn(
                    "min-w-0 overflow-hidden rounded-2xl border-2 transition-all",
                    isSelected
                      ? "border-border-focus bg-card shadow-sm opacity-100"
                      : "border-transparent bg-card opacity-60 hover:border-border-soft hover:bg-surface-hover-2 hover:opacity-100",
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-2xl px-3 py-3 text-left transition-colors",
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
                    <span className="min-w-0 flex flex-1 flex-col">
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
                        expanded ? `${page.name} 닫기` : `${page.name} 펼치기`
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
                        key={page.previewUrl ?? page.id}
                        previewUrl={page.previewUrl}
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
