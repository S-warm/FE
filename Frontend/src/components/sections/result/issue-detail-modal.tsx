import { useState, useEffect } from "react"
import { X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IssueDetailViewModel } from "@/types/view-model/result/issue-detail"

interface IssueDetailModalProps {
  isOpen: boolean
  issue: IssueDetailViewModel | null
  onClose: () => void
}

export function IssueDetailModal({ isOpen, issue, onClose }: IssueDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!issue) return null

  // 심각도에 따른 색상 매핑
  const badgeClassMap = {
    error: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    warning: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
    success: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
    neutral: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  } as const

  const severityLabel = issue.severity.tone ? issue.severity.tone.toUpperCase() : "정보"
  const badgeClass = badgeClassMap[issue.severity.tone as keyof typeof badgeClassMap] || badgeClassMap.neutral

  return (
    <>
      {/* 배경 오버레이 */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300",
            isAnimating ? "opacity-100" : "opacity-0"
          )}
          onClick={handleClose}
        />
      )}

      {/* 사이드 모달 */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-[45%] bg-white dark:bg-slate-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
          isAnimating ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 border-b bg-white dark:bg-slate-950 border-border-soft">
          <div className="flex items-start justify-between gap-4 p-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("px-2.5 py-1 rounded text-xs font-medium", badgeClass)}>
                  {severityLabel}
                </div>
                <span className="text-xs text-text-secondary">{issue.category}</span>
                {issue.subCategory && (
                  <span className="text-xs text-text-muted">/ {issue.subCategory}</span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-text-body">{issue.title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-surface-muted rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">닫기</span>
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-6">
          {/* 개요 섹션 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              개요
            </h3>
            <div className="bg-surface-subtle rounded-lg p-4 space-y-3">
              <div>
                <p className="text-caption-12-medium text-text-subtle font-medium">설명</p>
                <p className="text-body-14-regular text-text-muted mt-1 line-clamp-4">{issue.description}</p>
              </div>
              <div>
                <p className="text-caption-12-medium text-text-subtle font-medium">대상 요소</p>
                <code className="text-caption-12-regular text-text-body mt-1 bg-surface-muted p-2 rounded block font-mono text-wrap break-words">
                  {issue.targetHtml}
                </code>
              </div>
              {issue.tags.length > 0 && (
                <div>
                  <p className="text-caption-12-medium text-text-subtle font-medium">태그</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {issue.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex h-5 items-center rounded-full border border-border-soft bg-surface-subtle px-2 text-[11px] font-medium text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 영향받는 사용자 정보 섹션 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body">영향받는 사용자</h3>
            <div className="bg-surface-subtle rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-caption-12-medium text-text-subtle">영향받는 사용자</p>
                  <p className="text-body-14-medium text-text-body">
                    {issue.affectedUsersCount}명
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-caption-12-medium text-text-subtle">영향률</p>
                  <p className="text-body-14-medium text-text-body">
                    {issue.affectedUsersPercent}%
                  </p>
                </div>
                <div className="w-full bg-border-soft rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      issue.severity.tone === "error"
                        ? "bg-danger-text"
                        : issue.severity.tone === "warning"
                          ? "bg-warning-text"
                          : issue.severity.tone === "neutral"
                            ? "bg-info-text"
                            : "bg-success-text"
                    )}
                    style={{ width: `${issue.affectedUsersPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
