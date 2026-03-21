import { useMemo, useState } from "react"

import { ChevronDown, Sparkles, TrendingUp } from "lucide-react"

import { StatusBadge } from "@/components/atoms"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { aiFixPagesMock, defaultAiFixId, defaultAiFixPageId } from "@/mocks/result-ai-fix.mock"
import type { AiFixItem, AiFixPage } from "@/mocks/result-ai-fix.mock"

function PagePreview({ label }: { label: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#d6ddea] bg-gradient-to-br from-[#f2f5ff] via-white to-[#f4fbff]">
      <div className="aspect-[16/10] w-full" />
      <div className="absolute inset-0 grid place-items-center">
        <p className="rounded-full bg-white/85 px-3 py-1 text-caption-12-medium text-[#435176] shadow-sm">{label}</p>
      </div>
    </div>
  )
}

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
        "rounded-2xl border bg-white shadow-none",
        active ? "border-[#97a6e3]" : "border-[#d6ddea]"
      )}
    >
      <CardContent className="grid gap-3 px-5 py-4">
        <p className={cn("text-body-14-medium", active ? "text-[#2f5ae8]" : "text-[#2f3950]")}>{title}</p>
        <pre className="min-h-[220px] overflow-auto rounded-2xl bg-[#3f3f3f] p-5 text-[13px] leading-relaxed text-white">
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
  const [selectedPageId, setSelectedPageId] = useState<string>(defaultAiFixPageId)
  const [expandedPageId, setExpandedPageId] = useState<string>(defaultAiFixPageId)
  const [selectedFixId, setSelectedFixId] = useState<string>(defaultAiFixId)

  const selectedPage: AiFixPage = aiFixPagesMock.find((page) => page.id === selectedPageId) ?? aiFixPagesMock[0]

  const selectedFix: AiFixItem =
    selectedPage.fixes.find((fix) => fix.id === selectedFixId) ?? selectedPage.fixes[0]

  const fixes = useMemo(() => selectedPage.fixes, [selectedPage])

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit rounded-2xl border border-[#d6ddea] bg-white shadow-none">
        <CardContent className="grid gap-4 px-4 py-5">
          <div className="grid gap-3">
            <p className="text-caption-12-medium text-[#66708e]">페이지</p>
            <div className="grid gap-2">
              {aiFixPagesMock.map((page) => {
                const expanded = expandedPageId === page.id
                const isSelected = selectedPageId === page.id
                return (
                  <div key={page.id} className="rounded-2xl border border-[#e6ebf6] bg-[#fbfcff]">
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-body-14-medium transition-colors",
                        isSelected ? "text-[#283452]" : "text-[#66708e] hover:text-[#435176]"
                      )}
                      onClick={() => {
                        setSelectedPageId(page.id)
                        setExpandedPageId(page.id)
                        setSelectedFixId(page.fixes[0]?.id ?? selectedFixId)
                      }}
                    >
                      <span className="truncate">{page.name}</span>
                      <ChevronDown className={cn("size-4 transition-transform", expanded ? "rotate-180" : "")} />
                    </button>

                    {expanded ? (
                      <div className="grid gap-2 px-3 pb-3">
                        <PagePreview label={page.name} />
                        <p className="text-caption-12-regular text-[#8b96a8]">{page.fixes.length}건 수정 제안</p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-2xl border border-[#d6ddea] bg-white shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-caption-12-regular text-[#8b96a8]">페이지</p>
              <p className="text-body-14-medium text-[#2f3950]">{selectedPage.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="size-4 text-[#2f5ae8]" />
              <p className="text-body-14-medium text-[#2f3950]">AI 생성 수정 사항</p>
              <p className="text-caption-12-regular text-[#8b96a8]">감지된 접근성 및 UX 이슈에 대한 자동화된 코드 솔루션</p>
            </div>

            <div className="grid gap-3">
              <p className="text-caption-12-medium text-[#66708e]">수정 할 이슈 선택</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {fixes.map((fix) => {
                  const active = fix.id === selectedFixId
                  return (
                    <button
                      key={fix.id}
                      type="button"
                      onClick={() => setSelectedFixId(fix.id)}
                      className={cn(
                        "min-w-[260px] rounded-2xl border p-4 text-left transition-colors",
                        active
                          ? "border-[#97a6e3] bg-white"
                          : "border-[#e6ebf6] bg-[#fbfcff] hover:bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-body-14-medium text-[#2f3950]">{fix.title}</p>
                        <StatusBadge variant={fix.severity} size="sm">
                          {severityLabel(fix.severity)}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-caption-12-regular text-[#66708e]">+{fix.impactedUsers.count}명의 사용자가 개선 영향</p>
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

        <Card className="rounded-2xl border border-[#97a6e3] bg-white shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[#2f5ae8]" />
              <p className="text-body-14-medium text-[#2f3950]">영향</p>
            </div>

            <div className="rounded-2xl border border-[#eef1f7] bg-[#fbfcff] px-4 py-3">
              <p className="text-body-14-medium text-[#2f3950]">{selectedFix.impactSummary}</p>
            </div>

            <div className="rounded-2xl border border-[#eef1f7] bg-white px-4 py-3">
              <p className="text-caption-12-medium text-[#66708e]">{selectedFix.changeSummaryTitle}</p>
              <p className="mt-2 text-caption-12-regular leading-relaxed text-[#2f3950]">{selectedFix.changeSummaryBody}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResultAiFixPage

