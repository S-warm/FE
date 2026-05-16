import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { ApiServiceError, resultOverviewService } from "@/services"

export function useResultOverviewQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.overview(simulationId),
    queryFn: () => resultOverviewService.getOverview(simulationId),
    enabled: Boolean(simulationId),
    retry(failureCount, error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return false
      }

      return failureCount < 3
    },
  })
}
