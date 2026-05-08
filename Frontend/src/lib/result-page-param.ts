import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

import { defaultResultPageId, resultPagesMock } from "@/mocks/result-pages.mock"

const PAGE_PARAM_KEY = "page"

function resolveResultPageId(value: string | null) {
  if (!value) return defaultResultPageId
  const exists = resultPagesMock.some((page) => page.id === value)
  return exists ? value : defaultResultPageId
}

function useResultPageParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedPageId = resolveResultPageId(searchParams.get(PAGE_PARAM_KEY))

  const setSelectedPageId = useCallback(
    (nextPageId: string) => {
      const next = new URLSearchParams(searchParams)
      next.set(PAGE_PARAM_KEY, nextPageId)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  return { selectedPageId, setSelectedPageId, searchParams }
}

export { useResultPageParam }
