import { create } from "zustand"

import type { PersonaDevice } from "@/constants/persona-device"

interface SimulationDraftState {
  targetUrl: string
  projectTitle: string
  startedAt: string
  personaDevice: PersonaDevice
  setTargetUrl: (value: string) => void
  setProjectTitle: (value: string) => void
  setStartedAt: (value: string) => void
  setPersonaDevice: (value: PersonaDevice) => void
  reset: () => void
}

const initialState = {
  targetUrl: "",
  projectTitle: "",
  startedAt: "",
  personaDevice: "mac" as PersonaDevice,
}

export const useSimulationDraftStore = create<SimulationDraftState>((set) => ({
  ...initialState,
  setTargetUrl: (value) => set({ targetUrl: value }),
  setProjectTitle: (value) => set({ projectTitle: value }),
  setStartedAt: (value) => set({ startedAt: value }),
  setPersonaDevice: (value) => set({ personaDevice: value }),
  reset: () => set(initialState),
}))
