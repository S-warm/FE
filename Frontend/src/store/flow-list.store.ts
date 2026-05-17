import { create } from "zustand"

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

const initialFlowItems: FlowItem[] = [
  {
    id: "flow-1",
    name: "A-Mall 로그인 플로우",
    status: "high",
    steps: ["홈 진입", "로그인 버튼 클릭", "아이디 입력", "비밀번호 입력", "로그인 완료"],
  },
  {
    id: "flow-2",
    name: "장바구니 결제 플로우",
    status: "medium",
    steps: ["상품 선택", "장바구니 확인", "결제 수단 선택", "결제 완료"],
  },
  {
    id: "flow-3",
    name: "상품 검색 플로우",
    status: "low",
    steps: ["검색창 진입", "키워드 입력", "필터 적용", "상세 페이지 이동"],
  },
]

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
  flows: initialFlowItems,
  selectedFlowId: initialFlowItems[0]?.id ?? "",
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
