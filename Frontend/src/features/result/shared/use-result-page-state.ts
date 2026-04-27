import { useEffect, useState } from "react"

import { useResultPageParam } from "@/lib/result-page-param"

export function useResultPageState(defaultExpandedPageId?: string) {
  const { selectedPageId, setSelectedPageId } = useResultPageParam()
  const [expandedPageId, setExpandedPageId] = useState<string>(
    () => selectedPageId || defaultExpandedPageId || selectedPageId
  )

  useEffect(() => {
    setExpandedPageId(selectedPageId)
  }, [selectedPageId])

  return {
    selectedPageId,
    setSelectedPageId,
    expandedPageId,
    setExpandedPageId,
  }
}
