import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LayoutState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "uxswarm-layout",
      version: 1,
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
)

