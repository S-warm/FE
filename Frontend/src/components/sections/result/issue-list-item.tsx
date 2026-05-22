import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react"
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
    error: "bg-red-200 text-red-700",
    warning: "bg-orange-200 text-orange-800",
    success: "bg-emerald-200 text-emerald-800",
    neutral: "bg-blue-200 text-blue-800",
  } as const

  const severityIconColorMap = {
    error: "bg-red-100 text-red-400",
    warning: "bg-orange-100 text-orange-400",
    success: "bg-emerald-100 text-emerald-500",
    neutral: "bg-blue-100 text-blue-500",
  } as const

  const severityColor =
    severityColorMap[issue.severity.tone as keyof typeof severityColorMap] ??
    severityColorMap.neutral

  const severityIconColor =
    severityIconColorMap[issue.severity.tone as keyof typeof severityIconColorMap] ??
    severityIconColorMap.neutral

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
      className="group grid gap-3 rounded-2xl border border-border-strong bg-card py-4 pl-7 pr-5 shadow-none transition-shadow hover:shadow-md cursor-pointer"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="grid gap-2">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full",
                severityIconColor
              )}
            >
              <AlertTriangle className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-body-14-medium text-text-body">{issue.title}</p>
                <span className={cn("inline-flex h-5 items-center rounded-full px-2.5 text-[11px] font-medium", severityColor)}>
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
                    className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2.5 text-[11px] font-medium text-text-secondary"
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

          <p className="pl-9 text-caption-12-regular text-text-secondary">
            {issue.description}
          </p>
        </div>

        <div className="flex items-center justify-end border-t border-border-soft pt-3 md:border-0 md:pt-0">
          <button
            onClick={handleAiFix}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border-soft-2 bg-surface-muted px-4 py-2 text-caption-12-medium font-medium text-text-link transition-colors hover:bg-surface-muted-hover hover:text-text-link"
          >
            <Sparkles className="size-3.5" />
            AI 수정 받기
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-1.5 pl-9">
        <p className="text-caption-12-medium text-text-subtle">영향받는 요소</p>
        <code className="w-full rounded-lg bg-surface-muted px-3 py-2 text-[12px] font-medium text-text-secondary">
          {issue.selector}
        </code>
      </div>
    </div>
  )
}
