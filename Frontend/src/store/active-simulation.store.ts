import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { BackendSimulationStatus } from "@/shared/types/backend-api"

export interface ActiveSimulationSummary {
  id: string
  title: string
  status: BackendSimulationStatus
  createdAt: string
}

interface ActiveSimulationState {
  current: ActiveSimulationSummary | null
  setCurrent: (simulation: ActiveSimulationSummary) => void
  clearCurrent: () => void
}

export const useActiveSimulationStore = create<ActiveSimulationState>()(
  persist(
    (set) => ({
      current: null,
      setCurrent: (simulation) => set({ current: simulation }),
      clearCurrent: () => set({ current: null }),
    }),
    {
      name: "swarm-active-simulation",
    }
  )
)
