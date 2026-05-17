import { useState } from "react"
import { IssueListItem } from "./issue-list-item"
import { IssueDetailPanelNew } from "./issue-detail-panel-new"
import { mapResultIssueToDetail } from "@/types/view-model/result/issue-detail"
import type { IssueDetailViewModel } from "@/types/view-model/result/issue-detail"
import type { ResultIssueViewModel } from "@/types/view-model/result/result-issues"

interface IssueListSectionProps {
  issues: ResultIssueViewModel[]
  title?: string
  pageUrl?: string
}

export function IssueListSection({ issues, title = "이슈목록", pageUrl }: IssueListSectionProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssueDetailViewModel | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const handleDetailClick = (issue: ResultIssueViewModel) => {
    const detailViewModel = mapResultIssueToDetail(issue)
    setSelectedIssue(detailViewModel)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  if (issues.length === 0) {
    return (
      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">{title}</p>
        <div className="rounded-2xl border border-border-soft p-8 text-center">
          <p className="text-caption-12-regular text-text-muted">이슈가 없습니다.</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="grid gap-3">
        <p className="text-body-14-medium text-text-body">{title}</p>
        <div className="grid grid-cols-1 gap-3">
          {issues.map((issue) => (
            <IssueListItem
              key={issue.issueId}
              issue={issue}
              onDetailClick={handleDetailClick}
              pageUrl={pageUrl}
            />
          ))}
        </div>
      </section>

      {/* 우측 상세 패널 */}
      {isPanelOpen ? (
        <IssueDetailPanelNew
          key={selectedIssue?.title ?? "issue-detail-panel"}
          issue={selectedIssue}
          onClose={handleClosePanel}
        />
      ) : null}
    </>
  )
}
