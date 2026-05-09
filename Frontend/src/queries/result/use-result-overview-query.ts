import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { resultOverviewService } from "@/services"

export function useResultOverviewQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.overview(simulationId),
    queryFn: () => resultOverviewService.getOverview(simulationId),
    enabled: Boolean(simulationId),
  })
}
