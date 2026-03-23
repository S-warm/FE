import { create } from "zustand"

interface SimulationDraftState {
  targetUrl: string
  projectTitle: string
  startedAt: string
  setTargetUrl: (value: string) => void
  setProjectTitle: (value: string) => void
  setStartedAt: (value: string) => void
  reset: () => void
}

const initialState = {
  targetUrl: "",
  projectTitle: "",
  startedAt: "",
}

export const useSimulationDraftStore = create<SimulationDraftState>((set) => ({
  ...initialState,
  setTargetUrl: (value) => set({ targetUrl: value }),
  setProjectTitle: (value) => set({ projectTitle: value }),
  setStartedAt: (value) => set({ startedAt: value }),
  reset: () => set(initialState),
}))

