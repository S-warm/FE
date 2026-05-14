import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { simulationService } from "@/services"

const TERMINAL_STATUSES = new Set(["completed", "failed", "error", "cancelled"])

export function useSimulationStatusQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.simulations.status(simulationId),
    queryFn: () => simulationService.getSimulationStatus({ simulationId }),
    enabled: Boolean(simulationId),
    refetchInterval: (query) => {
      const status = String(query.state.data?.status ?? "").toLowerCase()
      return TERMINAL_STATUSES.has(status) ? false : 1500
    },
  })
}
