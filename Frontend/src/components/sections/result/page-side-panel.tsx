import { ChevronDown } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface ResultPageSidePanelItem {
  id: string
  name: string
  screenshotUrl?: string
  metaText?: string
}

function ScreenshotPreview({
  screenshotUrl,
  alt,
  onClick,
}: {
  screenshotUrl?: string
  alt: string
  onClick: () => void
}) {
  void screenshotUrl
  void alt

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid min-h-[92px] w-full place-items-center rounded-lg border border-border-strong bg-surface-subtle px-3 py-4 text-left transition-colors hover:bg-surface-hover-2"
    >
      <p className="text-center text-[11px] leading-5 text-text-muted">
        스크린샷이 없습니다.
      </p>
    </button>
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
        "rounded-2xl border border-border-strong bg-card shadow-none",
        motion.card,
      )}
    >
      <CardContent className="grid gap-3 px-4 py-4">
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
                      ? "border-[color:color-mix(in_srgb,var(--brand-accent)_28%,var(--color-border-soft-2))] bg-[color:color-mix(in_srgb,var(--brand-accent)_12%,white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand-accent)_10%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--brand-accent)_16%,white)]"
                      : "border-border-soft bg-surface-subtle hover:bg-surface-hover-2",
                  )}
                >
                  <div className="flex items-center gap-2 px-3">
                    <button
                      type="button"
                      className={cn(
                        "min-w-0 flex-1 rounded-2xl py-2 text-left text-[13px] font-medium transition-colors",
                        isSelected
                          ? "text-text-strong"
                          : "text-text-secondary hover:text-text-strong",
                      )}
                      onClick={() => onSelectPage(page.id)}
                    >
                      <span className="truncate">{page.name}</span>
                    </button>
                    <button
                      type="button"
                      className="grid size-8 shrink-0 place-items-center rounded-xl text-text-muted transition-colors hover:bg-surface-hover hover:text-text-strong"
                      onClick={() => onTogglePage(page.id)}
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
                    <div className="grid gap-1.5 px-3 pb-3">
                      <ScreenshotPreview
                        screenshotUrl={page.screenshotUrl}
                        alt={page.name}
                        onClick={() => onSelectPage(page.id)}
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
