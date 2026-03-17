const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  generate: "/generate",
  simulationSetup: "/simulation/setup",
  simulationProcess: "/simulation/process",
  result: "/result/:simulationId",
  error: "*",
} as const

export const buildResultOverviewPath = (simulationId: string) => `/result/${simulationId}/overview`

export default routes
