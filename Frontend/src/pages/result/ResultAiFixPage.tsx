import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Sparkles, TrendingUp } from "lucide-react"

import { StatusBadge } from "@/components/atoms"
import { EmptyState } from "@/components/sections/empty-state"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { adaptAiFixResponse, type AiFixViewModelPage } from "@/features/result/ai-fix/model/ai-fix-adapter"
import { fetchSimulationAiFix } from "@/features/result/shared/result-api"
import { useResultPageState } from "@/features/result/shared/use-result-page-state"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"

function CodePanel({
  title,
  active,
  code,
}: {
  title: string
  active?: boolean
  code: string
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card shadow-none",
        motion.card,
        active ? "border-border-focus" : "border-border-strong"
      )}
    >
      <CardContent className="grid gap-3 px-5 py-4">
        <p className={cn("text-body-14-medium", active ? "text-text-link" : "text-text-body")}>{title}</p>
        <pre className="min-h-[220px] overflow-auto rounded-2xl bg-code-surface p-5 text-[13px] leading-relaxed text-white">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}

function AiFixPageContent({
  page,
}: {
  page: AiFixViewModelPage
}) {
  const [selectedFixId, setSelectedFixId] = useState(page.fixes[0]?.id ?? "")
  const selectedFix = page.fixes.find((fix) => fix.id === selectedFixId) ?? page.fixes[0] ?? null

  if (!selectedFix) {
    return <EmptyState title="No AI fix suggestions" description="No fix suggestions are available for this page yet." />
  }

  return (
    <>
      <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
        <CardContent className="grid gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="size-4 text-text-link" />
            <p className="text-body-14-medium text-text-body">AI generated fix suggestions</p>
            <p className="text-caption-12-regular text-text-subtle">
              Backend-provided code changes to improve accessibility and UX.
            </p>
          </div>

          <div className="grid gap-3">
            <p className="text-caption-12-medium text-text-secondary">Select a fix suggestion</p>
            <div className="grid gap-3 md:grid-cols-3">
              {page.fixes.map((fix) => {
                const active = fix.id === selectedFix.id
                return (
                  <button
                    key={fix.id}
                    type="button"
                    onClick={() => setSelectedFixId(fix.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-colors",
                      motion.item,
                      active ? "border-border-focus bg-card" : "border-border-soft bg-surface-subtle hover:bg-card"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-body-14-medium text-text-body">{fix.title}</p>
                      <StatusBadge variant={fix.severity} size="sm">
                        {fix.severityLabel}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-caption-12-regular text-text-muted">
                      Improves the experience for {fix.affectedUsersCount} users
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <CodePanel title="Before code" code={selectedFix.beforeCode} />
        <CodePanel title="After AI fix" active code={selectedFix.afterCode} />
      </div>

      <Card className={cn("rounded-2xl border border-border-focus bg-card shadow-none", motion.card)}>
        <CardContent className="grid gap-4 px-6 py-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-text-link" />
            <p className="text-body-14-medium text-text-body">Expected impact</p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-body-14-medium text-text-body">{selectedFix.impactDescription}</p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
            <p className="text-caption-12-medium text-text-secondary">What changed</p>
            <p className="mt-2 text-caption-12-regular leading-relaxed text-text-body">{selectedFix.changeDescription}</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function AiFixLoadedView({
  pages,
}: {
  pages: AiFixViewModelPage[]
}) {
  const { selectedPageId, setSelectedPageId, expandedPageId, setExpandedPageId } = useResultPageState()
  const selectedPage = pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null

  if (!selectedPage) {
    return <EmptyState title="No AI fix suggestions" description="No page-level fix suggestions are available yet." className="h-[320px]" />
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        title="페이지"
        pages={pages}
        selectedPageId={selectedPage.id}
        expandedPageId={expandedPageId}
        onSelectPage={setSelectedPageId}
        onExpandPage={setExpandedPageId}
      />

      <div className="grid gap-4">
        <AiFixPageContent key={selectedPage.id} page={selectedPage} />
      </div>
    </div>
  )
}

function ResultAiFixContent({ simulationId }: { simulationId: string }) {
  const [aiFixResponse, setAiFixResponse] = useState<ReturnType<typeof adaptAiFixResponse> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const abortController = new AbortController()

    fetchSimulationAiFix(simulationId, abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) return
        setAiFixResponse(adaptAiFixResponse(response))
      })
      .catch((fetchError) => {
        if (abortController.signal.aborted) return
        setAiFixResponse(null)
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load AI fix suggestions.")
      })
      .finally(() => {
        if (abortController.signal.aborted) return
        setIsLoading(false)
      })

    return () => {
      abortController.abort()
    }
  }, [simulationId])

  if (error) {
    return <EmptyState title="AI fix unavailable" description={error} className="h-[320px]" />
  }

  if (isLoading || !aiFixResponse) {
    return (
      <EmptyState
        title="Loading AI fix suggestions..."
        description="Fetching AI-generated fix suggestions from the backend."
        className="h-[320px]"
      />
    )
  }

  if (!aiFixResponse.pages.length) {
    return (
      <EmptyState
        title="No AI fix suggestions"
        description="AI fix suggestions will appear when AI fix data is available."
        className="h-[320px]"
      />
    )
  }

  return <AiFixLoadedView key={simulationId} pages={aiFixResponse.pages} />
}

function ResultAiFixPage() {
  const { simulationId } = useParams()

  if (!simulationId) {
    return <EmptyState title="AI fix unavailable" description="Missing simulation id." className="h-[320px]" />
  }

  return <ResultAiFixContent key={simulationId} simulationId={simulationId} />
}

export default ResultAiFixPage
