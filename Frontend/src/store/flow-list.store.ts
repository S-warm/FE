import { create } from "zustand"

import { flowMockItems } from "@/mocks/flow-list.mock"

interface FlowItem {
  id: string
  name: string
  status: "high" | "medium" | "low"
  steps: string[]
}

interface FlowListState {
  flows: FlowItem[]
  selectedFlowId: string
  searchKeyword: string
  setSearchKeyword: (value: string) => void
  selectFlow: (id: string) => void
  addFlow: (name: string) => void
  removeFlow: (id: string) => void
  moveFlowUp: (id: string) => void
  moveFlowDown: (id: string) => void
}

function reorder(flows: FlowItem[], fromIndex: number, toIndex: number) {
  const next = [...flows]
  const [target] = next.splice(fromIndex, 1)

  if (!target) {
    return flows
  }

  next.splice(toIndex, 0, target)
  return next
}

export const useFlowListStore = create<FlowListState>((set) => ({
  flows: flowMockItems,
  selectedFlowId: flowMockItems[0]?.id ?? "",
  searchKeyword: "",
  setSearchKeyword: (value) => set({ searchKeyword: value }),
  selectFlow: (id) => set({ selectedFlowId: id }),
  addFlow: (name) =>
    set((state) => {
      const trimmed = name.trim()
      if (!trimmed) {
        return state
      }

      const nextItem: FlowItem = {
        id: `flow-${Date.now()}`,
        name: trimmed,
        status: "medium",
        steps: ["시작", "중간 단계", "완료"],
      }

      return {
        ...state,
        flows: [...state.flows, nextItem],
        selectedFlowId: nextItem.id,
      }
    }),
  removeFlow: (id) =>
    set((state) => {
      const nextFlows = state.flows.filter((item) => item.id !== id)
      const nextSelectedId =
        state.selectedFlowId === id ? (nextFlows[0]?.id ?? "") : state.selectedFlowId

      return {
        ...state,
        flows: nextFlows,
        selectedFlowId: nextSelectedId,
      }
    }),
  moveFlowUp: (id) =>
    set((state) => {
      const index = state.flows.findIndex((item) => item.id === id)
      if (index <= 0) {
        return state
      }
      return {
        ...state,
        flows: reorder(state.flows, index, index - 1),
      }
    }),
  moveFlowDown: (id) =>
    set((state) => {
      const index = state.flows.findIndex((item) => item.id === id)
      if (index === -1 || index >= state.flows.length - 1) {
        return state
      }
      return {
        ...state,
        flows: reorder(state.flows, index, index + 1),
      }
    }),
}))

export type { FlowItem, FlowListState }
