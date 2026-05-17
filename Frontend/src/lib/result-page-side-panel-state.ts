import { useState } from "react"

function useResultPageSidePanelState(selectedPageId: string, initialExpandedPageIds: string[] = []) {
  const [expandedPageIds, setExpandedPageIds] = useState<string[]>(() =>
    Array.from(new Set([selectedPageId, ...initialExpandedPageIds]))
  )

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
