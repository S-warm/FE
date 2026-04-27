import { create } from "zustand"

import type { PersonaDevice } from "@/constants/persona-device"

interface SimulationDraftState {
  targetUrl: string
  projectTitle: string
  startedAt: string
  personaDevice: PersonaDevice
  visionImpairment: number | null
  attentionLevel: number | null
  setTargetUrl: (value: string) => void
  setProjectTitle: (value: string) => void
  setStartedAt: (value: string) => void
  setPersonaDevice: (value: PersonaDevice) => void
  setVisionImpairment: (value: number | null) => void
  setAttentionLevel: (value: number | null) => void
  reset: () => void
}

const initialState = {
  targetUrl: "",
  projectTitle: "",
  startedAt: "",
  personaDevice: "mac" as PersonaDevice,
  visionImpairment: null,
  attentionLevel: null,
}

export const useSimulationDraftStore = create<SimulationDraftState>((set) => ({
  ...initialState,
  setTargetUrl: (value) => set({ targetUrl: value }),
  setProjectTitle: (value) => set({ projectTitle: value }),
  setStartedAt: (value) => set({ startedAt: value }),
  setPersonaDevice: (value) => set({ personaDevice: value }),
  setVisionImpairment: (value) => set({ visionImpairment: value }),
  setAttentionLevel: (value) => set({ attentionLevel: value }),
  reset: () => set(initialState),
}))
