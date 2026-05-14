import { ChevronRight, AlertTriangle, Sparkles, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { ResultIssueViewModel } from "@/types/view-model/result/result-issues"
import { cn } from "@/lib/utils"

interface IssueListItemProps {
  issue: ResultIssueViewModel
  onDetailClick: (issue: ResultIssueViewModel) => void
}

export function IssueListItem({ issue, onDetailClick }: IssueListItemProps) {
  const navigate = useNavigate()

  const severityColorMap = {
    error: "bg-danger-surface text-danger-text",
    warning: "bg-warning-surface text-warning-text",
    success: "bg-success-surface text-success-text",
    neutral: "bg-info-surface text-info-text",
  } as const

  const severityColor = severityColorMap[issue.severity.tone as keyof typeof severityColorMap] || severityColorMap.neutral

  const handleAiFix = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate("/result/ai")
  }

  return (
    <div
      onClick={() => onDetailClick(issue)}
      className={cn(
        "rounded-2xl border border-border-strong bg-card shadow-none hover:shadow-md transition-shadow cursor-pointer group grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
      )}
    >
      <div className="grid gap-2">
        <div className="flex items-start gap-2">
          <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl", severityColor)}>
            <AlertTriangle className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-body-14-medium text-text-body">{issue.title}</p>
              <span className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2.5 text-[11px] font-medium text-text-secondary">
                {issue.category}
              </span>
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
              {issue.affectedUsersCount}명 사용자 영향 ({issue.affectedUsersPercent}%)
            </p>
          </div>
        </div>

        <p className="text-caption-12-regular text-text-muted">{issue.description}</p>

        <div className="grid gap-1">
          <p className="text-caption-12-medium text-text-subtle">영향받는 요소</p>
          <code className="w-fit rounded-xl bg-surface-muted px-3 py-2 text-[12px] text-text-body">
            {issue.selector}
          </code>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 pt-3 border-t border-border-soft md:border-0 md:pt-0 md:flex-row">
        <button
          onClick={handleAiFix}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#e8f0ff] to-[#f0f5ff] dark:from-[#1e2a48] dark:to-[#2a3a5a] hover:from-[#d6e3ff] hover:to-[#e0ecff] dark:hover:from-[#2a3a5a] dark:hover:to-[#3a4a6a] text-[#2f5ae8] dark:text-[#6b9fff] text-caption-12-medium font-medium transition-all whitespace-nowrap"
        >
          <Sparkles className="size-3.5" />
          AI 수정 받기
          <ArrowRight className="size-3.5" />
        </button>

        <div
          className="p-2 hover:bg-surface-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 flex items-center justify-center"
          title="상세보기"
          onClick={(e) => {
            e.stopPropagation()
            onDetailClick(issue)
          }}
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </div>
      </div>
    </div>
  )
}
