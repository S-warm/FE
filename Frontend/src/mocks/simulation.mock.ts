export interface SimulationSummary {
  id: string
  siteName: string
  title: string
  createdAt: string
}

export const recentSimulations: SimulationSummary[] = [
  { id: "a-mall-login", siteName: "A - Mall", title: "A - Mall 로그인 플로우", createdAt: "2026-01-01" },
  { id: "a-mall-purchase", siteName: "A - Mall", title: "A - Mall 구매 플로우", createdAt: "2026-01-01" },
  { id: "fiora-login", siteName: "Fiora", title: "Fiora 로그인 플로우", createdAt: "2026-01-01" },
  { id: "sample-shop-signup", siteName: "Sample Shop", title: "Sample Shop 회원가입 플로우", createdAt: "2026-01-01" },
  { id: "demo-store-checkout", siteName: "Demo Store", title: "Demo Store 결제 플로우", createdAt: "2026-01-01" },
]

export const defaultSimulationId = recentSimulations[0]?.id ?? "a-mall-login"
