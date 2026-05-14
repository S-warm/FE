import { useState, useEffect } from "react"
import { X, BarChart3, Users, AlertCircle, Tag, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IssueDetailViewModel } from "@/types/view-model/result/issue-detail"

interface IssueDetailModalNewProps {
  isOpen: boolean
  issue: IssueDetailViewModel | null
  onClose: () => void
}

export function IssueDetailModalNew({ isOpen, issue, onClose }: IssueDetailModalNewProps) {
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

  if (!isOpen) {
    return null
  }

  if (!issue) {
    return null
  }

  // 심각도별 배경색
  const severityColor = getSeverityColor(issue.severity.tone as string)

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black transition-opacity duration-300",
          isAnimating ? "opacity-20" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* 사이드 모달 */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-[55%] bg-white dark:bg-slate-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
          isAnimating ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* 스티키 헤더 */}
        <div className={cn("sticky top-0 z-10 border-b bg-gradient-to-b", severityColor.bg)}>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold", severityColor.badge)}>
                    {issue.severity.tone.toUpperCase()}
                  </span>
                  <span className="text-xs text-text-secondary font-medium">{issue.category}</span>
                  {issue.subCategory && (
                    <span className="text-xs text-text-muted">• {issue.subCategory}</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-text-body leading-tight">{issue.title}</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-surface-muted rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 퀵 스탯 */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/20 dark:border-gray-700/30">
              <div className="space-y-1">
                <p className="text-caption-12-medium text-text-subtle">전체 발생</p>
                <p className="text-lg font-bold text-text-body">{issue.totalFailures}</p>
              </div>
              <div className="space-y-1">
                <p className="text-caption-12-medium text-text-subtle">발생률</p>
                <p className="text-lg font-bold text-text-body">{issue.failureRate.toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-caption-12-medium text-text-subtle">영향 페르소나</p>
                <p className="text-lg font-bold text-text-body">{issue.personas.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="p-6 space-y-6">
          {/* 1. 이슈 개요 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              이슈 개요
            </h3>
            <div className="bg-surface-subtle rounded-xl p-4 space-y-3 border border-border-soft">
              <div>
                <p className="text-caption-12-medium text-text-subtle mb-1">문제 설명</p>
                <p className="text-body-14-regular text-text-muted leading-relaxed">{issue.description}</p>
              </div>
              <div className="pt-3 border-t border-border-soft">
                <p className="text-caption-12-medium text-text-subtle mb-1">대상 HTML 요소</p>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-border-soft">
                  <code className="text-caption-12-regular text-text-body font-mono break-all">{issue.targetHtml}</code>
                </div>
              </div>
              {issue.tags.length > 0 && (
                <div className="pt-3 border-t border-border-soft">
                  <p className="text-caption-12-medium text-text-subtle mb-2">태그</p>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 h-6 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2. 페르소나별 분석 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              페르소나별 영향 분석
            </h3>
            <div className="bg-surface-subtle rounded-xl p-4 space-y-4 border border-border-soft">
              {issue.personas.length === 0 ? (
                <p className="text-body-14-regular text-text-muted text-center py-8">페르소나 데이터 없음</p>
              ) : (
                <>
                  {/* 페르소나별 바 차트 */}
                  <div className="space-y-3">
                    {issue.personas.map((persona, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-body-14-medium text-text-body">{persona.age}대</p>
                          <p className="text-caption-12-medium text-text-secondary">
                            {persona.count}명 ({persona.percentage}%)
                          </p>
                        </div>
                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all", getPersonaColor(persona.age))}
                            style={{ width: `${persona.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 페르소나별 세션 테이블 */}
                  <div className="pt-4 border-t border-border-soft">
                    <p className="text-caption-12-medium text-text-subtle mb-3">영향받은 세션</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {issue.affectedSessions.map((session, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-border-soft hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="text-caption-12-regular text-text-body font-mono">{session.sessionId}</span>
                          <span className="text-caption-12-medium text-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {session.personaAge}대
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 3. 개요 분석 그래프 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              발생 현황
            </h3>
            <div className="bg-surface-subtle rounded-xl p-4 space-y-4 border border-border-soft">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-body-14-medium text-text-body">전체 발생 현황</p>
                  <p className="text-body-14-medium text-text-body font-bold">{issue.totalFailures}건</p>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all", severityColor.bar)}
                    style={{ width: `${Math.min(issue.failureRate, 100)}%` }}
                  />
                </div>
                <p className="text-caption-12-regular text-text-muted">발생률: {issue.failureRate.toFixed(1)}%</p>
              </div>
              <div className="pt-3 border-t border-border-soft space-y-2">
                <p className="text-caption-12-medium text-text-subtle">영향받은 페르소나</p>
                <div className="space-y-2">
                  {issue.personas.length === 0 ? (
                    <p className="text-body-14-regular text-text-muted">페르소나 데이터 없음</p>
                  ) : (
                    issue.personas.map((persona, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-body-14-medium text-text-body">{persona.age}대</p>
                          <p className="text-caption-12-medium text-text-secondary">
                            {persona.count}명 ({persona.percentage}%)
                          </p>
                        </div>
                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all", getPersonaColor(persona.age))}
                            style={{ width: `${persona.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 4. URL 정보 */}
          {issue.url && (
            <section className="space-y-3">
              <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                이슈 발생 위치
              </h3>
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-surface-subtle border border-border-soft rounded-xl hover:bg-surface-muted transition-colors group"
              >
                <p className="text-caption-12-medium text-text-subtle mb-1">URL</p>
                <p className="text-body-14-regular text-blue-600 dark:text-blue-400 group-hover:underline break-all">
                  {issue.url || "정보 없음"}
                </p>
              </a>
            </section>
          )}

        </div>
      </div>
    </>
  )
}

/**
 * 심각도에 따른 색상 반환
 */
function getSeverityColor(
  tone: string
): {
  bg: string
  badge: string
  bar: string
} {
  const colors = {
    error: {
      bg: "bg-red-50 dark:bg-red-950/30",
      badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
      bar: "bg-red-500",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      badge: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
      bar: "bg-yellow-500",
    },
    success: {
      bg: "bg-green-50 dark:bg-green-950/30",
      badge: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
      bar: "bg-green-500",
    },
    neutral: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
      bar: "bg-blue-500",
    },
  }

  return colors[tone as keyof typeof colors] || colors.neutral
}

/**
 * 페르소나 나이대별 색상
 */
function getPersonaColor(age: string): string {
  const colors: Record<string, string> = {
    "10s": "bg-pink-500",
    "20s": "bg-purple-500",
    "30s": "bg-blue-500",
    "40s": "bg-cyan-500",
    "50s": "bg-green-500",
    "60s": "bg-yellow-500",
    "70s": "bg-orange-500",
    "80s": "bg-red-500",
  }

  return colors[age] || "bg-gray-500"
}
