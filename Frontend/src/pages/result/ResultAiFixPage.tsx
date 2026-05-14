import { useMemo, useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import { Sparkles, TrendingUp } from "lucide-react"

import { EmptyState } from "@/components/sections"
import { ResultPageSidePanel } from "@/components/sections/result/page-side-panel"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { StatusBadge } from "@/components/atoms"
import { Card, CardContent } from "@/components/ui/card"
import { useResultPageParam } from "@/lib/result-page-param"
import { useResultPageSidePanelState } from "@/lib/result-page-side-panel-state"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useResultAiFixQuery } from "@/queries"
import type {
  ResultAiFixItemViewModel,
  ResultAiFixPageViewModel,
} from "@/types/view-model/result/result-ai-fix"

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
        motion.card,
        active ? "border-border-focus" : "border-border-strong",
      )}
    >
      <CardContent className="grid gap-3 px-5 py-4">
        <p
          className={cn(
            "text-body-14-medium",
            active ? "text-text-link" : "text-text-body",
          )}
        >
          {title}
        </p>
        <pre className="min-h-[220px] overflow-auto rounded-2xl bg-code-surface p-5 text-[13px] leading-relaxed text-white">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}

function toStatusBadgeVariant(
  fix: ResultAiFixItemViewModel,
): "high" | "medium" | "low" {
  if (fix.severity.rank >= 4) return "high"
  if (fix.severity.rank >= 2) return "medium"
  return "low"
}

function firstFixIdForPage(page: ResultAiFixPageViewModel | null) {
  return page?.fixes[0]?.issueId
}

function ResultAiFixPage() {
  const { simulationId } = useParams()
  const location = useLocation()
  const resolvedId = simulationId ?? "unknown"

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useResultAiFixQuery(resolvedId)
  const pages = useMemo(() => data?.pages ?? [], [data])
  const pageIds = pages.map((page) => page.pageId)

  // URL 쿼리 파라미터에서 페이지 URL 읽기 (useLocation 사용)
  const pageUrlParam = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get("page")
  }, [location.search])

  // 페이지 URL 또는 pageId로부터 pageId 찾기
  const defaultPageId = useMemo(() => {
    if (pageUrlParam) {
      const decodedParam = decodeURIComponent(pageUrlParam)

      // 1. pageId로 직접 매칭 (AI Fix 탭에서 온 경우)
      if (decodedParam.startsWith("ai:")) {
        const directMatch = pages.find((page) => page.pageId === decodedParam)
        if (directMatch) {
          return directMatch.pageId
        }
      }

      // 2. URL로 매칭 (주요이슈 탭에서 온 경우)
      const urlMatch = pages.find((page) => page.pageUrl === decodedParam)
      if (urlMatch) {
        return urlMatch.pageId
      }
    }
    return pageIds[0]
  }, [pageUrlParam, pages, pageIds])

  // 페이지 선택 상태 초기화
  const { selectedPageId, setSelectedPageId } = useResultPageParam({
    availablePageIds: pageIds,
    defaultPageId: defaultPageId,
  })

  // 쿼리 파라미터로 페이지가 지정되었을 때 자동으로 해당 페이지로 이동
  useEffect(() => {
    if (pageUrlParam && defaultPageId && defaultPageId !== pageIds[0]) {
      setSelectedPageId(defaultPageId)
    }
  }, [pageUrlParam, defaultPageId, pageIds, setSelectedPageId])
  const { expandedPageIds, expandPage, togglePage } = useResultPageSidePanelState(
    selectedPageId,
  )
  const selectedPage: ResultAiFixPageViewModel | null =
    pages.find((page) => page.pageId === selectedPageId) ?? pages[0] ?? null
  const [selectedFixId, setSelectedFixId] = useState<string>("")

  const fixes = useMemo(() => selectedPage?.fixes ?? [], [selectedPage])
  const resolvedSelectedFixId = fixes.some((fix) => fix.issueId === selectedFixId)
    ? selectedFixId
    : (fixes[0]?.issueId ?? "")
  const selectedFix: ResultAiFixItemViewModel | null =
    fixes.find((fix) => fix.issueId === resolvedSelectedFixId) ?? fixes[0] ?? null

  const sidePages = useMemo(
    () =>
      pages.map((page) => ({
        id: page.pageId,
        name: page.pageName,
        screenshotUrl: page.screenshotUrl,
      })),
    [pages],
  )

  if (isLoading) {
    return <ResultPageSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="AI 수정 제안 데이터를 불러오지 못했습니다"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 시도"
        onAction={() => {
          void refetch()
        }}
      />
    )
  }

  if (!pages.length) {
    return (
      <EmptyState
        title="AI 수정 제안이 없습니다"
        description="선택한 시뮬레이션에 연결된 수정 제안 데이터가 아직 없습니다."
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ResultPageSidePanel
          pages={sidePages}
          selectedPageId={selectedPageId}
          expandedPageIds={expandedPageIds}
          onSelectPage={(pageId) => {
            const nextPage = pages.find((page) => page.pageId === pageId) ?? null
            const nextFixId = firstFixIdForPage(nextPage)
            setSelectedPageId(pageId)
            setSelectedFixId((prev) => nextFixId ?? prev)
            expandPage(pageId)
          }}
          onTogglePage={togglePage}
        />

      <div className="grid gap-4">
        {!selectedPage || !selectedFix ? (
          <EmptyState
            title="AI 수정 제안이 없습니다"
            description="선택한 페이지에 연결된 수정 제안 데이터가 아직 없습니다."
          />
        ) : (
          <>
            <Card
          className={cn(
            "rounded-2xl border border-border-strong bg-card shadow-none",
            motion.card,
          )}
        >
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="size-4 text-text-link" />
              <p className="text-body-14-medium text-text-body">AI 생성 수정 사항</p>
              <p className="text-caption-12-regular text-text-subtle">
                감지된 접근성 및 UX 이슈에 대한 자동화된 코드 솔루션
              </p>
            </div>

            <div className="grid gap-3">
              <p className="text-caption-12-medium text-text-secondary">수정 할 이슈 선택</p>
              <div className="grid gap-3 md:grid-cols-3">
                {fixes.map((fix) => {
                  const active = fix.issueId === resolvedSelectedFixId
                  return (
                    <button
                      key={fix.issueId}
                      type="button"
                      onClick={() => setSelectedFixId(fix.issueId)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        motion.item,
                        active
                          ? "border-border-focus bg-card"
                          : "border-border-soft bg-surface-subtle hover:bg-card",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-body-14-medium text-text-body">{fix.title}</p>
                        <StatusBadge variant={toStatusBadgeVariant(fix)} size="sm">
                          {fix.severity.label}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-caption-12-regular text-text-muted">
                        +{fix.impactedUsersCount}명의 사용자가 개선 영향
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <CodePanel title="이전 코드" code={selectedFix?.beforeCode ?? ""} />
          <CodePanel
            title="AI 생성 수정 이후 코드"
            active
            code={selectedFix?.afterCode ?? ""}
          />
        </div>

        <Card
          className={cn(
            "rounded-2xl border border-border-focus bg-card shadow-none",
            motion.card,
          )}
        >
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-text-link" />
              <p className="text-body-14-medium text-text-body">영향</p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-subtle px-4 py-3">
              <p className="text-body-14-medium text-text-body">
                {selectedFix?.impactSummary ?? "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-card px-4 py-3">
              <p className="text-caption-12-medium text-text-secondary">
                {selectedFix?.changeSummaryTitle ?? "-"}
              </p>
              <p className="mt-2 text-caption-12-regular leading-relaxed text-text-body">
                {selectedFix?.changeSummaryBody ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
            </>
          )}
      </div>
    </div>
  )
}

export default ResultAiFixPage
