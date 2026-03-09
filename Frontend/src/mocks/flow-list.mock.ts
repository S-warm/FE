export interface FlowMockItem {
  id: string
  name: string
  status: "high" | "medium" | "low"
  steps: string[]
}

export const flowMockItems: FlowMockItem[] = [
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
