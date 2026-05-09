import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { resultWcagService } from "@/services"

export function useResultWcagQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.wcag(simulationId),
    queryFn: () => resultWcagService.getWcag(simulationId),
    enabled: Boolean(simulationId),
  })
}
