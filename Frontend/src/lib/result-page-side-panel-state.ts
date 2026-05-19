import { useEffect, useState } from "react"

function useResultPageSidePanelState(selectedPageId: string, allPageIds: string[] = []) {
  const [expandedPageIds, setExpandedPageIds] = useState<string[]>(() =>
    Array.from(new Set([selectedPageId, ...allPageIds]))
  )

  const allPageIdsKey = allPageIds.join(",")
  useEffect(() => {
    if (allPageIds.length) {
      setExpandedPageIds((prev) => Array.from(new Set([...prev, ...allPageIds])))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPageIdsKey])

  const expandPage = (pageId: string) => {
    setExpandedPageIds((prev) => (prev.includes(pageId) ? prev : [...prev, pageId]))
  }

  const togglePage = (pageId: string) => {
    setExpandedPageIds((prev) => (prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]))
  }

  return {
    expandedPageIds,
    expandPage,
    togglePage,
  }
}

export { useResultPageSidePanelState }
