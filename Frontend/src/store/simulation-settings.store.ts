import { create } from "zustand"

type DeviceType = "desktop" | "tablet" | "mobile"
type AgeGroup = "10s" | "20s" | "30s" | "40s" | "50plus"
type GenderType = "all" | "female" | "male"

interface SimulationSettingsSnapshot {
  searchKeyword: string
  threshold: number
  device: DeviceType
  ageGroup: AgeGroup
  gender: GenderType
  categories: string[]
  includeLowContrast: boolean
  includeWarnings: boolean
  tags: string[]
}

interface SimulationSettingsState {
  searchKeyword: string
  threshold: number
  device: DeviceType
  ageGroup: AgeGroup
  gender: GenderType
  categories: string[]
  includeLowContrast: boolean
  includeWarnings: boolean
  tags: string[]
  setSearchKeyword: (value: string) => void
  setThreshold: (value: number) => void
  setDevice: (value: DeviceType) => void
  setAgeGroup: (value: AgeGroup) => void
  setGender: (value: GenderType) => void
  toggleCategory: (value: string) => void
  setIncludeLowContrast: (value: boolean) => void
  setIncludeWarnings: (value: boolean) => void
  removeTag: (value: string) => void
  addTag: (value: string) => void
  applySettings: (snapshot: SimulationSettingsSnapshot) => void
  reset: () => void
}

const initialState: SimulationSettingsSnapshot = {
  searchKeyword: "",
  threshold: 65,
  device: "desktop" as DeviceType,
  ageGroup: "20s" as AgeGroup,
  gender: "all" as GenderType,
  categories: ["contrast", "navigation"],
  includeLowContrast: true,
  includeWarnings: true,
  tags: ["로그인", "장바구니"],
}

export const useSimulationSettingsStore = create<SimulationSettingsState>((set) => ({
  ...initialState,
  setSearchKeyword: (value) => set({ searchKeyword: value }),
  setThreshold: (value) => set({ threshold: value }),
  setDevice: (value) => set({ device: value }),
  setAgeGroup: (value) => set({ ageGroup: value }),
  setGender: (value) => set({ gender: value }),
  toggleCategory: (value) =>
    set((state) => ({
      categories: state.categories.includes(value)
        ? state.categories.filter((item) => item !== value)
        : [...state.categories, value],
    })),
  setIncludeLowContrast: (value) => set({ includeLowContrast: value }),
  setIncludeWarnings: (value) => set({ includeWarnings: value }),
  removeTag: (value) =>
    set((state) => ({
      tags: state.tags.filter((item) => item !== value),
    })),
  addTag: (value) =>
    set((state) => ({
      tags: state.tags.includes(value) ? state.tags : [...state.tags, value],
    })),
  applySettings: (snapshot) =>
    set({
      ...snapshot,
    }),
  reset: () => set(initialState),
}))

export type {
  AgeGroup,
  DeviceType,
  GenderType,
  SimulationSettingsState,
  SimulationSettingsSnapshot,
}
