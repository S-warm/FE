import { useSearchParams } from "react-router-dom"

import { resolveResultPageId } from "@/features/result/shared/result-data"

const PAGE_PARAM_KEY = "page"

function useResultPageParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedPageId = resolveResultPageId(searchParams.get(PAGE_PARAM_KEY))

  const setSelectedPageId = (nextPageId: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(PAGE_PARAM_KEY, nextPageId)
    setSearchParams(next, { replace: true })
  }

  return { selectedPageId, setSelectedPageId, searchParams }
}

export { useResultPageParam }
