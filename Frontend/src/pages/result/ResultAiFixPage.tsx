import { useEffect, useMemo, useState } from "react"

import { Sparkles, TrendingUp } from "lucide-react"

import { StatusBadge } from "@/components/atoms"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { aiFixPagesMock, defaultAiFixId, defaultAiFixPageId } from "@/mocks/result-ai-fix.mock"
import type { AiFixItem, AiFixPage } from "@/mocks/result-ai-fix.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import { useResultPageParam } from "@/lib/result-page-param"

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

function severityLabel(severity: AiFixItem["severity"]) {
  if (severity === "high") return "높음"
  if (severity === "medium") return "중간"
  return "낮음"
}

function ResultAiFixPage() {
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const [expandedPageId, setExpandedPageId] = useState<string>(defaultAiFixPageId)
  const [selectedFixId, setSelectedFixId] = useState<string>(defaultAiFixId)

  useEffect(() => {
    setExpandedPageId(selectedPageId)
    const nextFixId = aiFixPagesMock.find((item) => item.id === selectedPageId)?.fixes[0]?.id
    if (nextFixId) setSelectedFixId(nextFixId)
  }, [selectedPageId])

  const selectedPage: AiFixPage = aiFixPagesMock.find((page) => page.id === selectedPageId) ?? aiFixPagesMock[0]

  const selectedFix: AiFixItem =
    selectedPage.fixes.find((fix) => fix.id === selectedFixId) ?? selectedPage.fixes[0]

  const fixes = useMemo(() => selectedPage.fixes, [selectedPage])
  const sidePages = useMemo(
    () =>
      resultPagesMock.map((page) => {
        const fixCount = aiFixPagesMock.find((item) => item.id === page.id)?.fixes.length ?? 0
        return {
          id: page.id,
          name: page.name,
          screenshotUrl: page.screenshotUrl,
          metaText: `${fixCount}건 수정 제안`,
        }
      }),
    []
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageId={expandedPageId}
        onSelectPage={(pageId) => {
          const nextFixId = aiFixPagesMock.find((item) => item.id === pageId)?.fixes[0]?.id
          setSelectedPageId(pageId)
          setSelectedFixId(nextFixId ?? selectedFixId)
          setExpandedPageId(pageId)
        }}
        onExpandPage={setExpandedPageId}
      />

      <div className="grid gap-4">
        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-caption-12-regular text-text-subtle">페이지</p>
              <p className="text-body-14-medium text-text-body">{selectedPage.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="size-4 text-text-link" />
              <p className="text-body-14-medium text-text-body">AI 생성 수정 사항</p>
              <p className="text-caption-12-regular text-text-subtle">감지된 접근성 및 UX 이슈에 대한 자동화된 코드 솔루션</p>
            </div>

            <div className="grid gap-3">
              <p className="text-caption-12-medium text-text-muted">수정 할 이슈 선택</p>
              <div className="grid gap-3 md:grid-cols-3">
                {fixes.map((fix) => {
                  const active = fix.id === selectedFixId
                  return (
                    <button
                      key={fix.id}
                      type="button"
                      onClick={() => setSelectedFixId(fix.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        active
                          ? "border-border-focus bg-card"
                          : "border-border-soft bg-surface-subtle hover:bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-body-14-medium text-text-body">{fix.title}</p>
                        <StatusBadge variant={fix.severity} size="sm">
                          {severityLabel(fix.severity)}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-caption-12-regular text-text-muted">
                        +{fix.impactedUsers.count}명의 사용자가 개선 영향
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <CodePanel title="이전 코드" code={selectedFix.beforeCode} />
          <CodePanel title="AI 생성 수정 이후 코드" active code={selectedFix.afterCode} />
        </div>

        <Card className="rounded-2xl border border-border-focus bg-card shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-text-link" />
              <p className="text-body-14-medium text-text-body">영향</p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
              <p className="text-body-14-medium text-text-body">{selectedFix.impactSummary}</p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-medium text-text-muted">{selectedFix.changeSummaryTitle}</p>
              <p className="mt-2 text-caption-12-regular leading-relaxed text-text-body">{selectedFix.changeSummaryBody}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultAiFixPage
