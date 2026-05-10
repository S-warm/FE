import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { SERVICE_CONFIG, simulationService } from "@/services"
import { useAuthStore } from "@/store/auth.store"

export function useSimulationListQuery(userId?: string) {
  const authenticatedUserId = useAuthStore((state) => state.user?.id)
  const resolvedUserId =
    userId ?? authenticatedUserId ?? SERVICE_CONFIG.defaultUserId

  return useQuery({
    queryKey: queryKeys.simulations.list(resolvedUserId),
    queryFn: () => simulationService.getSimulationList(resolvedUserId),
    enabled: Boolean(resolvedUserId),
  })
}
