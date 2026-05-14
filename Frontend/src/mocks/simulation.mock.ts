export interface SimulationSummary {
  id: string
  siteName: string
  title: string
  createdAt: string
}

export const recentSimulations: SimulationSummary[] = [
  { id: "mock1778490365303", siteName: "A - Mall", title: "A-Mall 회원가입 및 구매 플로우", createdAt: "2026-04-07" },
  { id: "a-mall-login", siteName: "A - Mall", title: "A - Mall 로그인 플로우", createdAt: "2026-04-05" },
  { id: "a-mall-purchase", siteName: "A - Mall", title: "A - Mall 구매 플로우", createdAt: "2026-04-03" },
]

export const defaultSimulationId = recentSimulations[0]?.id ?? "a-mall-login"
