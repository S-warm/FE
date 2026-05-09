import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

const PAGE_PARAM_KEY = "page"

interface UseResultPageParamOptions {
  availablePageIds?: string[]
  defaultPageId?: string
}

function resolveResultPageId(
  value: string | null,
  options: UseResultPageParamOptions,
) {
  const { availablePageIds = [], defaultPageId } = options
  const fallbackPageId = defaultPageId ?? availablePageIds[0] ?? ""

  if (!value) return fallbackPageId
  if (!availablePageIds.length) return value

  return availablePageIds.includes(value) ? value : fallbackPageId
}

function useResultPageParam(options: UseResultPageParamOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedPageId = resolveResultPageId(searchParams.get(PAGE_PARAM_KEY), options)

  const setSelectedPageId = useCallback(
    (nextPageId: string) => {
      const next = new URLSearchParams(searchParams)

      if (nextPageId) {
        next.set(PAGE_PARAM_KEY, nextPageId)
      } else {
        next.delete(PAGE_PARAM_KEY)
      }

      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  return { selectedPageId, setSelectedPageId, searchParams }
}

export { useResultPageParam }
