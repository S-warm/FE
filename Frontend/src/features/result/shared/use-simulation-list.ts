import { useEffect, useMemo, useRef, useState } from "react"

import { getApiUserId } from "@/shared/config/session"
import type { BackendSimulationListItem } from "@/shared/types/backend-api"
import { useActiveSimulationStore } from "@/store/active-simulation.store"

import { fetchSimulationList } from "./result-api"

function mergeSimulations(
  apiItems: BackendSimulationListItem[],
  activeItem: BackendSimulationListItem | null
) {
  const merged = activeItem ? [activeItem, ...apiItems] : apiItems
  const deduped = new Map<string, BackendSimulationListItem>()

  for (const item of merged) {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item)
    }
  }

  return Array.from(deduped.values()).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function useSimulationList() {
  const activeSimulation = useActiveSimulationStore((state) => state.current)
  const [items, setItems] = useState<BackendSimulationListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    abortControllerRef.current?.abort()
    abortControllerRef.current = abortController

    fetchSimulationList(getApiUserId(), abortController.signal)
      .then((response) => {
        if (abortController.signal.aborted) return
        setItems(response)
      })
      .catch((fetchError) => {
        if (abortController.signal.aborted) return
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load simulations.")
      })
      .finally(() => {
        if (abortController.signal.aborted) return
        setIsLoading(false)
      })

    return () => {
      abortController.abort()
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }, [])

  const simulations = useMemo(() => {
    const activeItem = activeSimulation
      ? {
          id: activeSimulation.id,
          title: activeSimulation.title,
          status: activeSimulation.status,
          createdAt: activeSimulation.createdAt,
        }
      : null

    return mergeSimulations(items, activeItem)
  }, [activeSimulation, items])

  return {
    simulations,
    isLoading,
    error,
  }
}
