import { useQuery } from "@tanstack/react-query"

import { SERVICE_CONFIG, simulationService } from "@/services"
import { queryKeys } from "@/queries/query-keys"

export function useSimulationListQuery(userId = SERVICE_CONFIG.defaultUserId) {
  return useQuery({
    queryKey: queryKeys.simulations.list(userId),
    queryFn: () => simulationService.getSimulationList(userId),
    enabled: Boolean(userId),
  })
}
