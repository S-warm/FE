import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { SERVICE_CONFIG, simulationService } from "@/services"

export function useSimulationHeaderQuery(
  simulationId: string,
  userId = SERVICE_CONFIG.defaultUserId,
) {
  return useQuery({
    queryKey: queryKeys.simulations.header(simulationId, userId),
    queryFn: () => simulationService.getSimulationHeader({ simulationId, userId }),
    enabled: Boolean(simulationId),
  })
}
