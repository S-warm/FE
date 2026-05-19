import { useEffect, useState } from "react"
import { AlertCircle, Globe, TrendingUp, X, Zap } from "lucide-react"

import { DonutChart } from "@/components/charts"
import { cn } from "@/lib/utils"
import type { IssueDetailViewModel } from "@/types/view-model/result/issue-detail"

interface IssueDetailPanelNewProps {
  issue: IssueDetailViewModel | null
  onClose: () => void
}

const severityToneMap = {
  error: {
    badge: "bg-danger-surface text-danger-text",
    icon: "text-danger-text",
    surface: "bg-surface-subtle",
  },
  warning: {
    badge: "bg-warning-surface text-warning-text",
    icon: "text-warning-text",
    surface: "bg-surface-subtle",
  },
  success: {
    badge: "bg-success-surface text-success-text",
    icon: "text-success-text",
    surface: "bg-surface-subtle",
  },
  neutral: {
    badge: "bg-info-surface text-info-text",
    icon: "text-info-text",
    surface: "bg-surface-subtle",
  },
} as const

export function IssueDetailPanelNew({
  issue,
  onClose,
}: IssueDetailPanelNewProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let id2: number
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setIsOpen(true))
    })
    return () => {
      cancelAnimationFrame(id1)
      cancelAnimationFrame(id2)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    window.setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!issue) {
    return null
  }

  const tone =
    severityToneMap[issue.severity.tone as keyof typeof severityToneMap] ??
    severityToneMap.neutral

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black transition-opacity duration-300",
          isOpen ? "opacity-20" : "opacity-0"
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          "fixed right-4 top-4 z-50 h-[calc(100%-2rem)] w-full max-w-[600px] overflow-y-auto overscroll-y-contain scrollbar-hide rounded-2xl border border-border-strong bg-card shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"
        )}
      >
        <div className="sticky top-0 z-10 border-b border-border-strong bg-card">
          <div className="grid gap-4 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold",
                      tone.badge
                    )}
                  >
                    {issue.severity.label}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    {issue.category}
                  </span>
                  {issue.subCategory ? (
                    <span className="text-xs text-text-muted">
                      {issue.subCategory}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-xl font-bold leading-tight text-text-body">
                  {issue.title}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 transition-colors hover:bg-surface-muted"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 border-t border-border-soft pt-2">
              <div className="text-center">
                <p className="mb-1 text-caption-12-medium text-text-subtle">
                  발생 건수
                </p>
                <p className="whitespace-nowrap text-lg font-bold text-text-body">
                  {issue.totalFailures}건
                </p>
              </div>
              <div className="text-center">
                <p className="mb-1 text-caption-12-medium text-text-subtle">
                  발생률
                </p>
                <p className="whitespace-nowrap text-lg font-bold text-text-body">
                  {issue.failureRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="mb-1 text-caption-12-medium text-text-subtle">
                  영향 연령대
                </p>
                <p className="whitespace-nowrap text-lg font-bold text-text-body">
                  {issue.personas.length}개
                </p>
              </div>
              <div className="text-center">
                <p className="mb-1 text-caption-12-medium text-text-subtle">
                  영향 세션
                </p>
                <p className="whitespace-nowrap text-lg font-bold text-text-body">
                  {issue.sessionIds.length}개
                </p>
              </div>
            </div>

            {issue.personas.length > 0 ? (
              <p className="text-center text-caption-12-medium text-text-secondary">
                최다 영향:{" "}
                <span className="font-semibold text-text-body">
                  {issue.personas[0].age} ({issue.personas[0].percentage}%)
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6">
          <section className="grid gap-3">
            <h3 className="flex items-center gap-2 text-body-14-medium font-semibold text-text-body">
              <AlertCircle className={cn("h-4 w-4", tone.icon)} />
              문제 분석
            </h3>
            <div className="grid gap-3 rounded-xl border border-border-soft bg-surface-subtle p-4">
              <div>
                <p className="mb-2 text-caption-12-medium font-semibold text-text-subtle">
                  설명
                </p>
                <p className="text-body-14-regular leading-relaxed text-text-muted">
                  {issue.description}
                </p>
              </div>
              <div className="border-t border-border-soft pt-3">
                <p className="mb-2 text-caption-12-medium font-semibold text-text-subtle">
                  대상 요소
                </p>
                <div className="rounded-lg border border-border-soft bg-card p-3">
                  <code className="break-all text-caption-12-regular font-mono text-text-body">
                    {issue.targetHtml}
                  </code>
                </div>
              </div>
              {issue.tags.length > 0 ? (
                <div className="border-t border-border-soft pt-3">
                  <p className="mb-2 text-caption-12-medium font-semibold text-text-subtle">
                    태그
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex h-6 items-center rounded-full border border-border-soft bg-card px-2.5 text-[11px] font-medium text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="flex items-center gap-2 text-body-14-medium font-semibold text-text-body">
              <AlertCircle className={cn("h-4 w-4", tone.icon)} />
              문제 특성
            </h3>
            <div className="grid gap-3 rounded-xl border border-border-soft bg-surface-subtle p-4">
              <div className="grid gap-2">
                <p className="text-caption-12-medium font-semibold text-text-subtle">
                  문제 유형
                </p>
                <p className="text-body-14-regular text-text-body">
                  {issue.category}
                  {issue.subCategory ? ` > ${issue.subCategory}` : ""}
                </p>
              </div>
              <div className="grid gap-2 border-t border-border-soft pt-3">
                <p className="text-caption-12-medium font-semibold text-text-subtle">
                  영향 범위
                </p>
                {issue.personas.length > 0 ? (
                  <div className="grid gap-1">
                    {issue.personas.map((persona) => (
                      <p
                        key={`${persona.age}-${persona.count}`}
                        className="text-body-14-regular text-text-body"
                      >
                        {persona.age}: {persona.count}명 ({persona.percentage}%)
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-14-regular text-text-muted">
                    데이터 미제공
                  </p>
                )}
              </div>
              <div className="grid gap-2 border-t border-border-soft pt-3">
                <p className="text-caption-12-medium font-semibold text-text-subtle">
                  심각도
                </p>
                <p className="text-body-14-regular text-text-body">
                  {issue.severity.label}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="flex items-center gap-2 text-body-14-medium font-semibold text-text-body">
              <TrendingUp className={cn("h-4 w-4", tone.icon)} />
              발생 현황
            </h3>
            <div className="grid gap-4 rounded-xl border border-border-soft bg-surface-subtle p-4">
              {issue.personas.length > 0 ? (
                <>
                  <div className="h-[200px]">
                    <DonutChart
                      data={issue.personas.map((persona) => ({
                        name: persona.age,
                        value: persona.count,
                        color: getPersonaColor(persona.age),
                      }))}
                      heightClassName="h-full"
                    />
                  </div>

                  <div className="grid gap-2 border-t border-border-soft pt-2">
                    {issue.personas.map((persona) => (
                      <div
                        key={`${persona.age}-${persona.count}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: getPersonaColor(persona.age) }}
                          />
                          <p className="text-body-14-medium text-text-body">
                            {persona.age}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-body-14-medium font-bold text-text-body">
                            {persona.count}명
                          </p>
                          <p className="text-caption-12-regular text-text-muted">
                            {persona.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-border-soft pt-2">
                    <div className="rounded-lg border border-border-soft bg-card p-3">
                      <p className="mb-1 text-caption-12-regular text-text-muted">
                        총 영향 인원
                      </p>
                      <p className="text-lg font-bold text-text-body">
                        {issue.personas.reduce((sum, persona) => sum + persona.count, 0)}
                        명
                      </p>
                    </div>
                    <div className="rounded-lg border border-border-soft bg-card p-3">
                      <p className="mb-1 text-caption-12-regular text-text-muted">
                        발생 횟수
                      </p>
                      <p className="text-lg font-bold text-text-body">
                        {issue.totalFailures}건
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-body-14-regular text-text-muted">
                    페르소나 데이터가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </section>

          {issue.affectedSessions.length > 0 ? (
            <section className="grid gap-3">
              <h3 className="flex items-center gap-2 text-body-14-medium font-semibold text-text-body">
                <Zap className={cn("h-4 w-4", tone.icon)} />
                영향받은 세션
              </h3>
              <div className="rounded-xl border border-border-soft bg-surface-subtle p-4">
                <div className="grid max-h-56 gap-2 overflow-y-auto">
                  {issue.affectedSessions.map((session) => (
                    <div
                      key={`${session.sessionId}-${session.personaAge}`}
                      className="flex items-center justify-between rounded-lg border border-border-soft bg-card p-3 transition-colors hover:bg-surface-muted"
                    >
                      <span className="font-mono text-caption-12-regular text-text-body">
                        {session.sessionId}
                      </span>
                      <span className="rounded-full bg-surface-muted px-2.5 py-1 text-caption-12-medium text-text-secondary">
                        {session.personaAge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {issue.url ? (
            <section className="grid gap-3 pb-4">
              <h3 className="flex items-center gap-2 text-body-14-medium font-semibold text-text-body">
                <Globe className={cn("h-4 w-4", tone.icon)} />
                발생 위치
              </h3>
              <div className="grid gap-3 rounded-xl border border-border-soft bg-surface-subtle p-4">
                <div className="grid gap-2">
                  <p className="text-caption-12-medium font-semibold text-text-subtle">
                    페이지
                  </p>
                  <p className="text-body-14-regular text-text-body">
                    {issue.url.includes("/search")
                      ? "검색 결과"
                      : issue.url.includes("/article")
                        ? "논문 상세"
                        : issue.url.includes("/journal")
                          ? "저널 상세"
                          : "상세 페이지"}
                  </p>
                </div>
                <div className="grid gap-2 border-t border-border-soft pt-3">
                  <p className="text-caption-12-medium font-semibold text-text-subtle">
                    영역
                  </p>
                  <p className="text-body-14-regular text-text-body">
                    {issue.targetHtml}
                  </p>
                </div>
                <div className="grid gap-2 border-t border-border-soft pt-3">
                  <p className="text-caption-12-medium font-semibold text-text-subtle">
                    URL
                  </p>
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border-soft bg-card p-3 transition-colors hover:bg-surface-muted"
                  >
                    <p className="break-all text-body-14-regular font-medium text-text-link">
                      {issue.url}
                    </p>
                  </a>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  )
}

function getPersonaColor(age: string): string {
  const colorMap: Record<string, string> = {
    "10s": "var(--color-persona-teen)",
    "20s": "var(--color-primary-100)",
    "30s": "var(--color-primary-200)",
    "40s": "var(--color-primary-300)",
    "50s": "var(--color-persona-fifty)",
    "60s": "var(--color-chart-form-start)",
    "70s": "var(--color-persona-eighty)",
    "80s": "var(--color-chart-validation)",
  }

  return colorMap[age] ?? "var(--color-primary-main)"
}
