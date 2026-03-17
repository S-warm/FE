export interface SimulationSummary {
  id: string
  title: string
  createdAt: string
}

export const recentSimulations: SimulationSummary[] = [
  { id: "a-mall-login", title: "A - Mall 로그인 플로우", createdAt: "2026-01-01" },
  { id: "a-mall-purchase", title: "A - Mall 구매 플로우", createdAt: "2026-01-01" },
  { id: "a-mall-search", title: "A - Mall 검색 플로우", createdAt: "2026-01-01" },
  { id: "a-mall-signup", title: "A - Mall 회원가입 플로우", createdAt: "2026-01-01" },
  { id: "a-mall-mypage", title: "A - Mall 마이페이지 플로우", createdAt: "2026-01-01" },
]

export const defaultSimulationId = recentSimulations[0]?.id ?? "a-mall-login"

