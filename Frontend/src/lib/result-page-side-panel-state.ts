import { useMemo, useState } from "react"

function useResultPageSidePanelState(selectedPageId: string, allPageIds: string[] = []) {
  const [manualExpandedPageIds, setManualExpandedPageIds] = useState<string[]>(() => {
    const initialPageId = selectedPageId || allPageIds[0]
    return initialPageId ? [initialPageId] : []
  })

  const expandedPageIds = useMemo(() => {
    const normalized = manualExpandedPageIds.filter((pageId) => allPageIds.includes(pageId))
    const fallbackPageId = selectedPageId || allPageIds[0]

    if (!fallbackPageId) {
      return normalized
    }

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
