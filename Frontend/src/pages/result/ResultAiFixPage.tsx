import { useEffect, useMemo, useState } from "react"

import { Check, Copy, Sparkles, TrendingUp } from "lucide-react"

import { StatusBadge } from "@/components/atoms"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"
import { aiFixPagesMock, defaultAiFixId, defaultAiFixPageId } from "@/mocks/result-ai-fix.mock"
import type { AiFixItem, AiFixPage } from "@/mocks/result-ai-fix.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import { useResultPageParam } from "@/lib/result-page-param"

function CodePanel({
  title,
  active,
  code,
  compareCode,
  mode,
}: {
  title: string
  active?: boolean
  code: string
  compareCode: string
  mode: "before" | "after"
}) {
  const [copied, setCopied] = useState(false)
  const currentLines = code.split("\n")
  const compareLines = compareCode.split("\n")
  const changedIndexes = new Set<number>()

  const maxLength = Math.max(currentLines.length, compareLines.length)
  for (let index = 0; index < maxLength; index += 1) {
    if ((currentLines[index] ?? "") !== (compareLines[index] ?? "")) {
      changedIndexes.add(index)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card shadow-none transition-colors",
        motion.card,
        active ? "border-border-focus shadow-[0_0_0_1px_var(--color-border-focus)]" : "border-border-strong"
      )}
    >
      <CardContent className="grid gap-3 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className={cn("text-body-14-medium", active ? "text-text-link" : "text-text-body")}>{title}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-border-soft bg-surface-subtle px-2.5 py-1.5 text-[12px] text-text-secondary transition-colors hover:bg-surface-hover-2"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "복사됨" : "코드 복사"}
          </button>
        </div>
        <div className="min-h-[220px] overflow-auto rounded-2xl bg-code-surface p-3">
          <code className="grid gap-1 text-[13px] leading-relaxed text-white">
            {currentLines.map((line, index) => {
              const changed = changedIndexes.has(index)
              const marker = mode === "after" ? "+" : "-"

              return (
                <div
                  key={`${title}-${index}`}
                  className={cn(
                    "grid grid-cols-[auto_1fr] items-start gap-3 rounded-xl px-3 py-2",
                    changed &&
                      (mode === "after"
                        ? "bg-brand-accent/18 ring-1 ring-brand-accent/25"
                        : "bg-danger-surface/18 ring-1 ring-danger-text/18")
                  )}
                >
                  <div className="flex items-center gap-2 text-[11px] text-white/45">
                    <span className={cn("w-3 font-semibold", changed ? "text-white/70" : "text-white/30")}>
                      {changed ? marker : ""}
                    </span>
                    <span>{index + 1}</span>
                  </div>
                  <span className={cn("whitespace-pre-wrap break-all", changed ? "text-white" : "text-white/88")}>
                    {line || " "}
                  </span>
                </div>
              )
            })}
          </code>
        </div>
      </CardContent>
    </Card>
  )
}

function severityLabel(severity: AiFixItem["severity"]) {
  if (severity === "high") return "높음"
  if (severity === "medium") return "중간"
  return "낮음"
}

function firstFixIdForPage(pageId: string) {
  return aiFixPagesMock.find((item) => item.id === pageId)?.fixes[0]?.id
}

function ResultAiFixPage() {
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const [expandedPageIds, setExpandedPageIds] = useState<string[]>(() => [selectedPageId ?? defaultAiFixPageId])
  const [selectedFixId, setSelectedFixId] = useState<string>(() => firstFixIdForPage(selectedPageId) ?? defaultAiFixId)

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
  const toggleExpandedPage = (pageId: string) => {
    setExpandedPageIds((prev) => (prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]))
  }

  useEffect(() => {
    setExpandedPageIds((prev) => (prev.includes(selectedPageId) ? prev : [...prev, selectedPageId]))
  }, [selectedPageId])

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ResultPageSidePanel
        pages={sidePages}
        selectedPageId={selectedPageId}
        expandedPageIds={expandedPageIds}
        onSelectPage={(pageId) => {
          const nextFixId = firstFixIdForPage(pageId)
          setSelectedPageId(pageId)
          setSelectedFixId((prev) => nextFixId ?? prev)
          setExpandedPageIds((prev) => (prev.includes(pageId) ? prev : [...prev, pageId]))
        }}
        onExpandPage={toggleExpandedPage}
      />

      <div className="grid gap-4">
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="size-4 text-text-link" />
              <p className="text-body-14-medium text-text-body">AI 생성 수정 사항</p>
              <p className="text-caption-12-regular text-text-subtle">감지된 접근성 및 UX 이슈에 대한 자동화된 코드 솔루션</p>
            </div>

            <div className="grid gap-3">
              <p className="text-caption-12-medium text-text-secondary">수정 할 이슈 선택</p>
              <div className="grid gap-3 md:grid-cols-3">
                {fixes.map((fix) => {
                  const active = fix.id === selectedFixId
                  return (
                    <button
                      key={fix.id}
                      type="button"
                      onClick={() => setSelectedFixId(fix.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        motion.item,
                        active
                          ? "border-border-focus bg-brand-subtle shadow-[0_0_0_1px_var(--color-border-focus)]"
                          : "border-border-soft bg-surface-subtle hover:bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className={cn("text-body-14-medium", active ? "text-text-link" : "text-text-body")}>
                          {fix.title}
                        </p>
                        <StatusBadge variant={fix.severity} size="sm">
                          {severityLabel(fix.severity)}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-caption-12-regular text-text-muted">
                        +{fix.impactedUsers.count}명의 사용자가 개선 영향
                      </p>
                      {active ? (
                        <div className="mt-3 h-1 rounded-full bg-brand-accent" aria-hidden="true" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <CodePanel title="이전 코드" code={selectedFix.beforeCode} compareCode={selectedFix.afterCode} mode="before" />
          <CodePanel
            title="AI 생성 수정 이후 코드"
            active
            code={selectedFix.afterCode}
            compareCode={selectedFix.beforeCode}
            mode="after"
          />
        </div>

        <Card className={cn("rounded-2xl border border-border-focus bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-text-link" />
              <p className="text-body-14-medium text-text-body">영향</p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
              <p className="text-body-14-medium text-text-body">{selectedFix.impactSummary}</p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-medium text-text-secondary">{selectedFix.changeSummaryTitle}</p>
              <p className="mt-2 text-caption-12-regular leading-relaxed text-text-body">{selectedFix.changeSummaryBody}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultAiFixPage
