import { ChevronRight, AlertTriangle, Sparkles, ArrowRight } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { cn } from "@/lib/utils"
import type { ResultIssueViewModel } from "@/types/view-model/result/result-issues"

interface IssueListItemProps {
  issue: ResultIssueViewModel
  onDetailClick: (issue: ResultIssueViewModel) => void
  pageUrl?: string
}

export function IssueListItem({
  issue,
  onDetailClick,
  pageUrl,
}: IssueListItemProps) {
  const navigate = useNavigate()
  const { simulationId } = useParams()

  const severityColorMap = {
    error: "bg-danger-surface text-danger-text",
    warning: "bg-warning-surface text-warning-text",
    success: "bg-success-surface text-success-text",
    neutral: "bg-info-surface text-info-text",
  } as const

  const severityColor =
    severityColorMap[issue.severity.tone as keyof typeof severityColorMap] ??
    severityColorMap.neutral

  const handleAiFix = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (pageUrl) {
      navigate(`/result/${simulationId}/ai?page=${encodeURIComponent(pageUrl)}`)
      return
    }

    navigate(`/result/${simulationId}/ai`)
  }

  return (
    <div
      onClick={() => onDetailClick(issue)}
      className={cn(
        "group grid gap-4 rounded-2xl border border-border-strong bg-card px-5 py-4 shadow-none transition-shadow hover:shadow-md md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
      )}
    >
      <div className="grid gap-2">
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl",
              severityColor
            )}
          >
            <AlertTriangle className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-body-14-medium text-text-body">{issue.title}</p>
              <span className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2.5 text-[11px] font-medium text-text-secondary">
                {issue.category}
              </span>
              {issue.subCategory ? (
                <span className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2.5 text-[11px] font-medium text-text-secondary">
                  {issue.subCategory}
                </span>
              ) : null}
              {issue.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2 text-[11px] font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-1 text-caption-12-regular text-text-subtle">
              실패 {issue.totalFailures}건 · 영향 세션 {issue.affectedUsersCount}건 ·
              실패율 {issue.failureRate}%
            </p>
          </div>
        </div>

        <p className="text-caption-12-regular text-text-muted">
          {issue.description}
        </p>

        <div className="grid gap-1">
          <p className="text-caption-12-medium text-text-subtle">영향 요소</p>
          <code className="w-fit rounded-xl bg-surface-muted px-3 py-2 text-[12px] text-text-body">
            {issue.selector}
          </code>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-border-soft pt-3 md:flex-row md:border-0 md:pt-0">
        <button
          onClick={handleAiFix}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border-soft-2 bg-surface-muted px-4 py-2 text-caption-12-medium font-medium text-text-link transition-colors hover:bg-surface-muted-hover hover:text-text-link"
        >
          <Sparkles className="size-3.5" />
          AI 수정 받기
          <ArrowRight className="size-3.5" />
        </button>

        <div
          className="flex shrink-0 items-center justify-center rounded-lg p-2 opacity-0 transition-colors group-hover:opacity-100 hover:bg-surface-muted"
          title="상세보기"
          onClick={(event) => {
            event.stopPropagation()
            onDetailClick(issue)
          }}
        >
          <ChevronRight className="h-5 w-5 text-text-secondary" />
        </div>
      </div>
    </div>
  )
}
