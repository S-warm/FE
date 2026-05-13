import { useState, useEffect } from "react"
import { X, AlertCircle, TrendingUp, Zap, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { DonutChart } from "@/components/charts"
import type { IssueDetailViewModel } from "@/types/view-model/result/issue-detail"
import type { DonutChartDatumViewModel } from "@/types/view-model/common/chart"

interface IssueDetailPanelNewProps {
  isOpen: boolean
  issue: IssueDetailViewModel | null
  onClose: () => void
}

export function IssueDetailPanelNew({ isOpen, issue, onClose }: IssueDetailPanelNewProps) {
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

  if (!isOpen || !issue) {
    return null
  }

  // 심각도별 색상
  const severityConfig = {
    error: {
      bg: "bg-red-50 dark:bg-red-950/30",
      badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
      bar: "bg-red-500",
      icon: "text-red-600 dark:text-red-400",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      badge: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
      bar: "bg-yellow-500",
      icon: "text-yellow-600 dark:text-yellow-400",
    },
    success: {
      bg: "bg-green-50 dark:bg-green-950/30",
      badge: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
      bar: "bg-green-500",
      icon: "text-green-600 dark:text-green-400",
    },
    neutral: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
      bar: "bg-blue-500",
      icon: "text-blue-600 dark:text-blue-400",
    },
  }

  const tone = issue.severity.tone as keyof typeof severityConfig
  const colors = severityConfig[tone] || severityConfig.neutral

  return (
    <>
      {/* 배경 오버레이 */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black transition-opacity duration-300",
            isAnimating ? "opacity-20" : "opacity-0"
          )}
          onClick={handleClose}
        />
      )}

      {/* 우측 패널 */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-[600px] bg-white dark:bg-slate-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
          isAnimating ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 border-b bg-[#e7eaf8] dark:bg-[#e7eaf8]">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold", colors.badge)}>
                    {issue.severity.tone.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600 font-medium">{issue.category}</span>
                  {issue.subCategory && (
                    <span className="text-xs text-gray-500">• {issue.subCategory}</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{issue.title}</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* 핵심 지표 */}
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-300">
              <div className="text-center">
                <p className="text-caption-12-medium text-gray-600 mb-1">발생 건수</p>
                <p className="text-lg font-bold text-gray-800 whitespace-nowrap">{issue.totalFailures} <span className="text-gray-600">건</span></p>
              </div>
              <div className="text-center">
                <p className="text-caption-12-medium text-gray-600 mb-1">발생률</p>
                <p className="text-lg font-bold text-gray-800 whitespace-nowrap">{issue.failureRate.toFixed(1)} <span className="text-gray-600">%</span></p>
              </div>
              <div className="text-center">
                <p className="text-caption-12-medium text-gray-600 mb-1">영향 페르소나</p>
                <p className="text-lg font-bold text-gray-800 whitespace-nowrap">{issue.personas.length} <span className="text-gray-600">개</span></p>
              </div>
              <div className="text-center">
                <p className="text-caption-12-medium text-gray-600 mb-1">영향 세션</p>
                <p className="text-lg font-bold text-gray-800 whitespace-nowrap">{issue.sessionIds.length} <span className="text-gray-600">개</span></p>
              </div>
            </div>

            {/* 최다 영향 페르소나 */}
            {issue.personas.length > 0 && (
              <div className="pt-3 text-center text-sm">
                <p className="text-caption-12-medium text-gray-600">
                  최다 영향: <span className="text-gray-800 font-semibold">{issue.personas[0].age}대 ({issue.personas[0].percentage}%)</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="p-6 space-y-6">
          {/* 1. 문제 분석 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
              <AlertCircle className={cn("w-4 h-4", colors.icon)} />
              문제 분석
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3 border border-border-soft">
              <div>
                <p className="text-caption-12-medium text-text-subtle mb-2 font-semibold">설명</p>
                <p className="text-body-14-regular text-text-muted leading-relaxed">{issue.description}</p>
              </div>
              <div className="pt-3 border-t border-border-soft">
                <p className="text-caption-12-medium text-text-subtle mb-2 font-semibold">대상 요소</p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-border-soft">
                  <code className="text-caption-12-regular text-text-body font-mono break-all">{issue.targetHtml}</code>
                </div>
              </div>
              {issue.tags.length > 0 && (
                <div className="pt-3 border-t border-border-soft">
                  <p className="text-caption-12-medium text-text-subtle mb-2 font-semibold">태그</p>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 h-6 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2. 문제 특징 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
              <AlertCircle className={cn("w-4 h-4", colors.icon)} />
              문제 특징
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3 border border-border-soft">
              <div className="space-y-2">
                <p className="text-caption-12-medium text-text-subtle font-semibold">문제 유형</p>
                <p className="text-body-14-regular text-text-body">
                  {issue.category} {issue.subCategory && `> ${issue.subCategory}`}
                </p>
              </div>

              <div className="pt-3 border-t border-border-soft space-y-2">
                <p className="text-caption-12-medium text-text-subtle font-semibold">영향 범위</p>
                {issue.personas.length > 0 ? (
                  <div className="space-y-1">
                    {issue.personas.map((persona, idx) => (
                      <p key={idx} className="text-body-14-regular text-text-body">
                        {persona.age}대: {persona.count}명 ({persona.percentage}%)
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-14-regular text-text-muted">데이터 미제공</p>
                )}
              </div>

              <div className="pt-3 border-t border-border-soft space-y-2">
                <p className="text-caption-12-medium text-text-subtle font-semibold">심각도</p>
                <p className="text-body-14-regular text-text-body">
                  {issue.severity.tone === "error" && "높음"}
                  {issue.severity.tone === "warning" && "중간"}
                  {issue.severity.tone === "neutral" && "낮음"}
                </p>
              </div>
            </div>
          </section>

          {/* 3. 발생 현황 - 도넛 차트 */}
          <section className="space-y-3">
            <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
              <TrendingUp className={cn("w-4 h-4", colors.icon)} />
              발생 현황
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-4 border border-border-soft">
              {/* 도넛 차트 */}
              {issue.personas.length > 0 ? (
                <div className="space-y-4">
                  {/* 도넛 차트 렌더링 */}
                  <div className="h-[200px]">
                    <DonutChart
                      data={issue.personas.map((persona) => ({
                        name: `${persona.age}대`,
                        value: persona.count,
                        color: getPersonaColor(persona.age),
                      }))}
                      heightClassName="h-full"
                    />
                  </div>

                  {/* 연령대별 상세 정보 */}
                  <div className="space-y-2 pt-2 border-t border-border-soft">
                    {issue.personas.map((persona, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPersonaColor(persona.age) }}
                          />
                          <p className="text-body-14-medium text-text-body">{persona.age}대</p>
                        </div>
                        <div className="text-right">
                          <p className="text-body-14-medium text-text-body font-bold">{persona.count}명</p>
                          <p className="text-caption-12-regular text-text-muted">{persona.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 통계 요약 */}
                  <div className="pt-2 border-t border-border-soft space-y-3">
                    <p className="text-caption-12-medium text-text-subtle font-semibold">통계 요약</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-caption-12-regular text-text-muted mb-1">총 영향 인원</p>
                        <p className="text-lg font-bold text-text-body">
                          {issue.personas.reduce((acc, p) => acc + p.count, 0)}명
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-caption-12-regular text-text-muted mb-1">발생 현황</p>
                        <p className="text-lg font-bold text-text-body">{issue.totalFailures}건</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-body-14-regular text-text-muted">페르소나 데이터 없음</p>
                </div>
              )}
            </div>
          </section>

          {/* 3. 세션 정보 */}
          {issue.affectedSessions.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
                <Zap className={cn("w-4 h-4", colors.icon)} />
                영향받은 세션
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-border-soft">
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {issue.affectedSessions.map((session, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-border-soft hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-caption-12-regular text-text-body font-mono">{session.sessionId}</span>
                      <span className="text-caption-12-medium text-text-secondary bg-gray-200 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                        {session.personaAge}대
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 4. 발생 위치 */}
          {issue.url && (
            <section className="space-y-3 pb-4">
              <h3 className="text-body-14-medium text-text-body font-semibold flex items-center gap-2">
                <Globe className={cn("w-4 h-4", colors.icon)} />
                발생 위치
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3 border border-border-soft">
                {/* 페이지 정보 추출 */}
                <div className="space-y-2">
                  <p className="text-caption-12-medium text-text-subtle font-semibold">페이지</p>
                  <p className="text-body-14-regular text-text-body">
                    {issue.url.includes('/search')
                      ? '검색 결과'
                      : issue.url.includes('/article')
                      ? '논문 상세'
                      : issue.url.includes('/journal')
                      ? '저널 상세'
                      : '상세 페이지'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-soft space-y-2">
                  <p className="text-caption-12-medium text-text-subtle font-semibold">영역</p>
                  <p className="text-body-14-regular text-text-body">{issue.targetHtml}</p>
                </div>

                <div className="pt-3 border-t border-border-soft space-y-2">
                  <p className="text-caption-12-medium text-text-subtle font-semibold">URL</p>
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-border-soft hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <p className="text-body-14-regular text-blue-600 dark:text-blue-400 group-hover:underline break-all font-medium text-sm">
                      {issue.url}
                    </p>
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

// 연령대별 색상 맵핑
function getPersonaColor(age: string): string {
  const colorMap: Record<string, string> = {
    "10": "#3b82f6",
    "10s": "#3b82f6",
    "20": "#60a5fa",
    "20s": "#60a5fa",
    "30": "#93c5fd",
    "30s": "#93c5fd",
    "40": "#bfdbfe",
    "40s": "#bfdbfe",
    "50": "#e0e7ff",
    "50s": "#e0e7ff",
    "60": "#7c3aed",
    "60s": "#7c3aed",
    "70": "#a855f7",
    "70s": "#a855f7",
    "80": "#d946ef",
    "80s": "#d946ef",
    "90": "#ec4899",
    "90s": "#ec4899",
  }
  return colorMap[age] || "#6366f1" // 기본값: 인디고
}
