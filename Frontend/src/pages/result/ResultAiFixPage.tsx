import { startTransition, useEffect, useMemo, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import { Check, Copy, Sparkles, TrendingUp } from "lucide-react"

import { StatusBadge } from "@/components/atoms"
import { EmptyState } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { formatCodeForDisplay } from "@/lib/code-formatting"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { resolveResultPageScreenshotSet } from "@/features/result/assets"
import { useResultAiFixQuery, useResultIssuesQuery } from "@/queries"
import type {
  ResultAiFixItemViewModel,
  ResultAiFixPageViewModel,
} from "@/types/view-model/result/result-ai-fix"

function resolveErrorDescription(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

function CodePanel({
  title,
  active,
  code,
}: {
  title: string
  active?: boolean
  code: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<"idle" | "success" | "error">("idle")
  const [highlightedHtml, setHighlightedHtml] = useState<string>("")
  const [shouldHighlight, setShouldHighlight] = useState(false)
  const displayCode = useMemo(() => formatCodeForDisplay(code), [code])
  const hasLongCode = code.length > 360

  useEffect(() => {
    if (copyFeedback === "idle") return

    const timeoutId = window.setTimeout(() => {
      setCopyFeedback("idle")
    }, 1500)

    return () => window.clearTimeout(timeoutId)
  }, [copyFeedback])

  useEffect(() => {
    if (!active && !isExpanded) return

    startTransition(() => {
      setShouldHighlight(true)
    })
  }, [active, isExpanded])

  useEffect(() => {
    if (!shouldHighlight) return

    let isCancelled = false
    let idleCallbackId: number | null = null
    let timeoutId: number | null = null

    async function runHighlight() {
      try {
        const { highlightCodeToHtml } = await import("@/lib/code-highlighting")
        const result = await highlightCodeToHtml(code)
        if (isCancelled) return

        setHighlightedHtml(result.html)
      } catch {
        if (isCancelled) return

        setHighlightedHtml("")
      }
    }

    if (typeof window.requestIdleCallback === "function") {
      idleCallbackId = window.requestIdleCallback(() => {
        void runHighlight()
      })
    } else {
      timeoutId = window.setTimeout(() => {
        void runHighlight()
      }, 0)
    }

    return () => {
      isCancelled = true
      if (idleCallbackId !== null) {
        window.cancelIdleCallback(idleCallbackId)
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [code, shouldHighlight])

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(displayCode)
      setCopyFeedback("success")
    } catch {
      setCopyFeedback("error")
    }
  }

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card shadow-none",
        motion.card,
        active ? "border-border-focus" : "border-border-strong"
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={cn(
              "text-body-14-medium",
              active ? "text-text-link" : "text-text-body"
            )}
          >
            {title}
          </p>
          <div className="flex items-center gap-2">
            {hasLongCode ? (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                className="rounded-lg border border-border-soft bg-card px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:bg-surface-hover"
              >
                {isExpanded ? "접기" : "펼치기"}
              </button>
            ) : null}
          </div>
        </div>
        <div
          className={cn(
            "relative flex-1 overflow-x-auto overflow-y-auto rounded-2xl bg-code-surface transition-[max-height] duration-300",
            isExpanded ? "max-h-[640px]" : "max-h-[340px]"
          )}
        >
          <button
            type="button"
            onClick={handleCopyCode}
            aria-label="코드 복사"
            className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg border border-white/5 bg-white/0 text-white/65 backdrop-blur-sm transition-colors hover:bg-white/5 hover:text-white/90"
          >
            {copyFeedback === "success" ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
          {highlightedHtml ? (
            <div
              className="ai-fix-code-content"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="h-full whitespace-pre-wrap break-words p-5 text-[13px] leading-relaxed text-white">
              <code>{displayCode}</code>
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function toStatusBadgeVariant(
  fix: ResultAiFixItemViewModel
): "high" | "medium" | "low" {
  if (fix.severity.rank >= 4) return "high"
  if (fix.severity.rank >= 2) return "medium"
  return "low"
}

function firstFixIdForPage(page: ResultAiFixPageViewModel | null) {
  return page?.fixes[0]?.issueId
}

function ResultAiFixPage() {
  const { simulationId } = useParams()
  const location = useLocation()
  const resolvedId = simulationId ?? "unknown"

  const { data, error, isLoading, isError, refetch } = useResultAiFixQuery(resolvedId)
  const { data: issuesData } = useResultIssuesQuery(resolvedId)
  const pages = useMemo(() => data?.pages ?? [], [data])
  const pageIds = pages.map((page) => page.pageId)

  const pageUrlParam = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get("page")
  }, [location.search])

  const defaultPageId = useMemo(() => {
    if (pageUrlParam) {
      const decodedParam = decodeURIComponent(pageUrlParam)

      const directMatch = pages.find((page) => page.pageId === decodedParam)
      if (directMatch) {
        return directMatch.pageId
      }

      const urlMatch = pages.find((page) => page.pageUrl === decodedParam)
      if (urlMatch) {
        return urlMatch.pageId
      }
    }

    return pageIds[0]
  }, [pageUrlParam, pages, pageIds])

  const { selectedPageId, setSelectedPageId } = useResultPageParam({
    availablePageIds: pageIds,
    defaultPageId,
  })

  useEffect(() => {
    if (pageUrlParam && defaultPageId && defaultPageId !== pageIds[0]) {
      setSelectedPageId(defaultPageId)
    }
  }, [pageUrlParam, defaultPageId, pageIds, setSelectedPageId])

  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(
    selectedPageId,
    pageIds,
  )
  const selectedPage: ResultAiFixPageViewModel | null =
    pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null
  const [selectedFixId, setSelectedFixId] = useState<string>("")

  const issueTitleLookup = useMemo(() => {
    const lookup = new Map<string, string>()

    for (const page of issuesData?.pages ?? []) {
      for (const issue of page.issues) {
        if (issue.issueId) {
          lookup.set(issue.issueId, issue.title)
          lookup.set(`${page.pageUrl ?? ""}::${issue.issueId}`, issue.title)
        }
      }
    }

    return lookup
  }, [issuesData])

  const fixes = useMemo(
    () =>
      (selectedPage?.fixes ?? []).map((fix) => {
        const scopedKey = `${selectedPage?.pageUrl ?? ""}::${fix.issueId}`
        const mappedTitle =
          issueTitleLookup.get(scopedKey) ??
          issueTitleLookup.get(fix.issueId) ??
          fix.title

        return mappedTitle === fix.title ? fix : { ...fix, title: mappedTitle }
      }),
    [issueTitleLookup, selectedPage]
  )
  const resolvedSelectedFixId = fixes.some((fix) => fix.issueId === selectedFixId)
    ? selectedFixId
    : (fixes[0]?.issueId ?? "")
  const selectedFix: ResultAiFixItemViewModel | null =
    fixes.find((fix) => fix.issueId === resolvedSelectedFixId) ?? fixes[0] ?? null

  const sidePages = useMemo(
    () =>
      pages.map((page) => {
        const screenshotSet = resolveResultPageScreenshotSet({
          pageId: page.pageId,
          screenshotUrl: page.screenshotUrl,
        })

        return {
          id: page.pageId,
          name: page.pageName,
          url: page.pageUrl,
          previewUrl: screenshotSet.previewUrl,
        }
      }),
    [pages]
  )

  if (isLoading) {
    return <ResultPageSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="AI 수정 제안 데이터를 불러오지 못했습니다"
        description={resolveErrorDescription(
          error,
          "잠시 후 다시 시도해 주세요."
        )}
        actionLabel="다시 시도"
        onAction={() => {
          void refetch()
        }}
      />
    )
  }

  if (!pages.length) {
    return (
      <EmptyState
        title="AI 수정 제안이 없습니다"
        description="선택한 시뮬레이션에 연결된 수정 제안 데이터가 아직 없습니다."
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageIds={expandedPageIds}
        onSelectPage={(pageId) => {
          const nextPage = pages.find((page) => page.pageId === pageId) ?? null
          const nextFixId = firstFixIdForPage(nextPage)
          setSelectedPageId(pageId)
          setSelectedFixId((prev) => nextFixId ?? prev)
          expandPage(pageId)
        }}
        onTogglePage={togglePage}
      />

      <div className="grid gap-4">
        {!selectedPage || !selectedFix ? (
          <EmptyState
            title="AI 수정 제안이 없습니다"
            description="선택한 페이지에 연결된 수정 제안 데이터가 아직 없습니다."
          />
        ) : (
          <>
            <Card
              className={cn(
                "rounded-2xl border border-border-strong bg-card shadow-none",
                motion.card
              )}
            >
              <CardContent className="grid gap-4 px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="size-4 text-text-link" />
                  <p className="text-body-14-medium text-text-body">
                    AI 생성 수정 사항
                  </p>
                  <p className="text-caption-12-regular text-text-subtle">
                    감지된 접근성 및 UX 이슈를 대상으로 생성된 코드 제안입니다.
                  </p>
                </div>

                <div className="grid gap-3">
                  <p className="text-caption-12-medium text-text-secondary">
                    수정 대상 이슈 선택
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {fixes.map((fix) => {
                      const active = fix.issueId === resolvedSelectedFixId

                      return (
                        <button
                          key={fix.issueId}
                          type="button"
                          onClick={() => setSelectedFixId(fix.issueId)}
                          className={cn(
                            "min-w-0 rounded-2xl border p-4 text-left transition-colors",
                            motion.item,
                            active
                              ? "border-border-focus bg-card"
                              : "border-border-soft bg-surface-subtle hover:bg-card"
                          )}
                        >
                          <div className="flex min-w-0 items-start justify-between gap-3">
                            <p
                              title={fix.title}
                              className="min-w-0 flex-1 text-body-14-medium leading-5 text-text-body line-clamp-2"
                            >
                              {fix.title}
                            </p>
                            <StatusBadge
                              variant={toStatusBadgeVariant(fix)}
                              size="sm"
                              className="self-start"
                            >
                              {fix.severity.label}
                            </StatusBadge>
                          </div>
                          <p className="mt-2 text-caption-12-regular text-text-muted">
                            +{fix.impactedUsersCount}명의 사용자에게 개선 영향
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
              <CodePanel
                key={`before:${selectedFix.issueId}`}
                title="이전 코드"
                code={selectedFix.beforeCode}
              />
              <CodePanel
                key={`after:${selectedFix.issueId}`}
                title="AI 생성 수정 이후 코드"
                active
                code={selectedFix.afterCode}
              />
            </div>

            <Card
              className={cn(
                "rounded-2xl border border-border-focus bg-card shadow-none",
                motion.card
              )}
            >
              <CardContent className="grid gap-4 px-6 py-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-text-link" />
                  <p className="text-body-14-medium text-text-body">영향</p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
                  <p className="text-body-14-medium text-text-body">
                    {selectedFix.impactSummary}
                  </p>
                </div>

                <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
                  <p className="text-caption-12-medium text-text-secondary">
                    {selectedFix.changeSummaryTitle}
                  </p>
                  <p className="mt-2 text-caption-12-regular leading-relaxed text-text-body">
                    {selectedFix.changeSummaryBody}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default ResultAiFixPage
