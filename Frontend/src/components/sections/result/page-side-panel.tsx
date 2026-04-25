import { ChevronDown } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"

export interface ResultPageSidePanelItem {
  id: string
  name: string
  screenshotUrl: string
  metaText?: string
}

function ResultPageSidePanel({
  title = "페이지",
  pages,
  selectedPageId,
  expandedPageId,
  onSelectPage,
  onExpandPage,
  topSlot,
}: {
  title?: string
  pages: ResultPageSidePanelItem[]
  selectedPageId: string
  expandedPageId: string
  onSelectPage: (pageId: string) => void
  onExpandPage: (pageId: string) => void
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
              const expanded = expandedPageId === page.id
              const isSelected = selectedPageId === page.id
              const contentId = `result-side-panel-${page.id}`
              return (
                <div
                  key={page.id}
                  className={cn(
                    "rounded-2xl border transition-colors",
                    isSelected
                      ? "border-border-soft-2 bg-surface-muted hover:bg-surface-muted-hover"
                      : "border-border-soft bg-surface-subtle hover:bg-surface-hover-2"
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-body-14-medium transition-colors",
                      isSelected ? "text-text-strong" : "text-text-secondary hover:text-text-strong"
                    )}
                    onClick={() => {
                      onSelectPage(page.id)
                      onExpandPage(page.id)
                    }}
                  >
                    <span className="truncate">{page.name}</span>
                    <ChevronDown className={cn("size-4 transition-transform", expanded ? "rotate-180" : "")} />
                  </button>

                  {expanded ? (
                    <div id={contentId} className="grid gap-2 px-3 pb-3">
                      <div className="overflow-hidden rounded-xl border border-border-strong bg-card">
                        <img
                          src={page.screenshotUrl}
                          alt={page.name}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[16/10] w-full object-cover"
                        />
                      </div>
                      {page.metaText ? (
                        <p className="text-caption-12-regular text-text-subtle">{page.metaText}</p>
                      ) : null}
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
