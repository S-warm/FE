import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { simulationService } from "@/services"

export const SIMULATION_STATUS_POLLING_INTERVAL_MS = 1500

export function useSimulationStatusQuery(
  simulationId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.simulations.status(simulationId),
    queryFn: () => simulationService.getSimulationStatus(simulationId),
    enabled: enabled && Boolean(simulationId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "completed" || status === "failed") {
        return false
      }
      return SIMULATION_STATUS_POLLING_INTERVAL_MS
    },
  })
}
