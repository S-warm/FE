import { useEffect, useMemo, useRef, useState } from "react"

function useResultPageSidePanelState(selectedPageId: string, allPageIds: string[] = []) {
  const [manualExpandedPageIds, setManualExpandedPageIds] = useState<string[]>(() => {
    const initialPageId = selectedPageId || allPageIds[0]
    return initialPageId ? [initialPageId] : []
  })

  // 최초로 allPageIds가 실제 값으로 채워질 때 한 번만 모든 페이지 열기
  const hasExpandedAllRef = useRef(false)
  useEffect(() => {
    if (!hasExpandedAllRef.current && allPageIds.length > 0) {
      hasExpandedAllRef.current = true
      setManualExpandedPageIds(allPageIds)
    }
  }, [allPageIds])

  const expandedPageIds = useMemo(() => {
    const normalized = manualExpandedPageIds.filter((pageId) => allPageIds.includes(pageId))
    const fallbackPageId = selectedPageId || allPageIds[0]

    if (!fallbackPageId) return normalized

    return normalized.includes(fallbackPageId)
      ? normalized
      : [...normalized, fallbackPageId]
  }, [allPageIds, manualExpandedPageIds, selectedPageId])

  const expandPage = (pageId: string) => {
    setManualExpandedPageIds((prev) => (prev.includes(pageId) ? prev : [...prev, pageId]))
  }

  const togglePage = (pageId: string) => {
    setManualExpandedPageIds((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    )
  }

  return {
    expandedPageIds,
    expandPage,
    togglePage,
  }
}

export { useResultPageSidePanelState }
