import { useMemo, useState } from "react"

function useResultPageSidePanelState(selectedPageId: string, initialExpandedPageIds: string[] = []) {
  const [manuallyExpandedPageIds, setManuallyExpandedPageIds] = useState<string[]>(initialExpandedPageIds)

  const expandedPageIds = useMemo(
    () => Array.from(new Set([selectedPageId, ...manuallyExpandedPageIds])),
    [manuallyExpandedPageIds, selectedPageId]
  )

  const expandPage = (pageId: string) => {
    setManuallyExpandedPageIds((prev) => (prev.includes(pageId) ? prev : [...prev, pageId]))
  }

  return {
    expandedPageIds,
    expandPage,
  }
}

export { useResultPageSidePanelState }
