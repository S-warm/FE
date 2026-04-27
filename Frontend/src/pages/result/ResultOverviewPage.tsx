import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"

import { AlertCircle, Clock, Flag, Users } from "lucide-react"

import { HorizontalBarChart } from "@/components/charts"
import { EmptyState } from "@/components/sections/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { adaptOverviewResponse } from "@/features/result/overview/model/overview-adapter"
import type { OverviewPanelCard } from "@/features/result/overview/model/overview-adapter"
import { fetchSimulationOverview } from "@/features/result/shared/result-api"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { BackendSimulationOverviewResponse } from "@/shared/types/backend-api"

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-3 px-5 py-4">
        <div className="flex items-center justify-between text-text-subtle">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-surface-muted">{icon}</span>
            <p className="text-caption-12-medium">{title}</p>
          </div>
          <button type="button" className="grid size-6 place-items-center rounded-lg" aria-label="Metric info" title={description}>
            <AlertCircle className="size-4" />
          </button>
        </div>
        <div className="grid gap-1">
          <p className="text-title-24-bold text-text-strong">{value}</p>
          <p className="text-caption-12-regular text-text-subtle">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PanelCard({ panel }: { panel: OverviewPanelCard }) {
  return (
    <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
      <CardContent className="grid gap-4 px-6 py-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="grid gap-1">
            <p className="text-body-14-medium text-text-body">{panel.pageName}</p>
            <p className="truncate text-caption-12-regular text-text-muted">{panel.pageUrl}</p>
          </div>
          <div className="inline-flex h-7 items-center rounded-full border border-border-soft bg-surface-subtle px-3 text-caption-12-medium text-text-secondary">
            Success {panel.panelSuccessRate.toFixed(panel.panelSuccessRate % 1 === 0 ? 0 : 1)}%
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">Entered</p>
            <p className="mt-1 text-body-16-medium text-text-body">{panel.totalEntered.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">Passed</p>
            <p className="mt-1 text-body-16-medium text-text-body">{panel.totalPassed.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3">
            <p className="text-caption-12-regular text-text-muted">Avg time</p>
            <p className="mt-1 text-body-16-medium text-text-body">
              {panel.avgTimeSeconds.toFixed(panel.avgTimeSeconds % 1 === 0 ? 0 : 1)} sec
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="grid grid-cols-[72px_repeat(4,minmax(0,1fr))] gap-2 px-2 text-caption-12-medium text-text-secondary">
            <p>Age</p>
            <p>Entered</p>
            <p>Passed</p>
            <p>Drop-off</p>
            <p>Success</p>
          </div>
          <div className="grid gap-2">
            {panel.ageRows.map((row) => (
              <div
                key={row.ageGroup}
                className="grid grid-cols-[72px_repeat(4,minmax(0,1fr))] gap-2 rounded-xl border border-border-subtle bg-surface-subtle px-3 py-2 text-caption-12-regular text-text-body"
              >
                <p>{row.ageGroup}</p>
                <p>{row.entered}</p>
                <p>{row.passed}</p>
                <p>{row.dropOff}</p>
                <p>{row.successRate.toFixed(row.successRate % 1 === 0 ? 0 : 1)}%</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultOverviewContent({ simulationId }: { simulationId: string }) {
  const [overviewResponse, setOverviewResponse] = useState<BackendSimulationOverviewResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    abortControllerRef.current?.abort()
    abortControllerRef.current = abortController

    fetchSimulationOverview(simulationId, abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) return
        setOverviewResponse(response)
      })
      .catch((fetchError) => {
        if (abortController.signal.aborted) return
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load overview.")
        setOverviewResponse(null)
      })
      .finally(() => {
        if (abortController.signal.aborted) return
        setIsLoading(false)
      })

    return () => {
      abortController.abort()
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }, [simulationId])

  const viewModel = useMemo(() => {
    return overviewResponse ? adaptOverviewResponse(overviewResponse) : null
  }, [overviewResponse])

  const metricIcons = [<Flag className="size-4" />, <Users className="size-4" />, <Clock className="size-4" />, <AlertCircle className="size-4" />]

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 md:grid-cols-4">
        {(viewModel?.metrics ?? [
          { key: "taskSuccessRate", title: "Task success rate", value: "...", description: "Loading summary..." },
          { key: "totalAgents", title: "Total agents", value: "...", description: "Loading summary..." },
          { key: "avgCompletionSeconds", title: "Average completion time", value: "...", description: "Loading summary..." },
          { key: "dropOffAgents", title: "Drop-off agents", value: "...", description: "Loading summary..." },
        ]).map((metric, index) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metricIcons[index] ?? <AlertCircle className="size-4" />}
          />
        ))}
      </section>

      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">Panel success rates</p>
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="px-6 py-5">
            {error ? (
              <EmptyState title="Overview unavailable" description={error} className="h-[240px]" />
            ) : (
              <HorizontalBarChart
                data={viewModel?.progress ?? []}
                barColor="var(--color-neutral-500)"
                emptyTitle={isLoading ? "Loading overview..." : "No overview data"}
                emptyDescription={
                  isLoading
                    ? "Fetching overview data from the backend."
                    : "Overview data will appear when funnel panels are available."
                }
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">Panel breakdown</p>
        {error ? null : viewModel?.panels.length ? (
          <div className="grid gap-3">
            {viewModel.panels.map((panel) => (
              <PanelCard key={panel.id} panel={panel} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={isLoading ? "Loading panel breakdown..." : "No panel breakdown"}
            description={
              isLoading
                ? "Fetching panel-level metrics from the backend."
                : "Panel breakdown appears when overview panel data is available."
            }
          />
        )}
      </section>
    </div>
  )
}

function ResultOverviewPage() {
  const { simulationId } = useParams()

  if (!simulationId) {
    return <EmptyState title="Overview unavailable" description="Missing simulation id." className="h-[320px]" />
  }

  return <ResultOverviewContent key={simulationId} simulationId={simulationId} />
}

export default ResultOverviewPage
