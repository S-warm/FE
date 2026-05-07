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
  expandedPageIds,
  onSelectPage,
  onExpandPage,
  topSlot,
}: {
  title?: string
  pages: ResultPageSidePanelItem[]
  selectedPageId: string
  expandedPageIds: string[]
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
              const expanded = expandedPageIds.includes(page.id)
              const isSelected = selectedPageId === page.id
              return (
                <div
                  key={page.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all duration-200",
                    isSelected
                      ? "border-border-soft-3 bg-surface-muted-hover shadow-sm"
                      : "border-border-soft bg-surface-subtle hover:bg-surface-hover-2"
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-body-14-medium transition-colors",
                      isSelected ? "text-text-strong" : "text-text-secondary hover:text-text-strong"
                    )}
                    onClick={() => onExpandPage(page.id)}
                  >
                    <span className="truncate">{page.name}</span>
                    <ChevronDown className={cn("size-4 transition-transform", expanded ? "rotate-180" : "")} />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                      expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                    <div
                      className={cn(
                        "grid gap-2 px-3 pb-3 pt-0 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
                        expanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectPage(page.id)}
                        disabled={!expanded}
                        className={cn(
                          "overflow-hidden rounded-xl border bg-card transition-all duration-200 text-left",
                          isSelected ? "border-border-soft-3 bg-surface-hover shadow-sm" : "border-border-strong"
                        )}
                      >
                        <img
                          src={page.screenshotUrl}
                          alt={page.name}
                          loading="lazy"
                          decoding="async"
                          className={cn(
                            "aspect-[16/10] w-full object-cover transition-[filter,opacity]",
                            isSelected ? "opacity-100 saturate-[1.06] contrast-[1.08]" : "opacity-92"
                          )}
                        />
                      </button>
                    </div>
                    </div>
                  </div>
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
