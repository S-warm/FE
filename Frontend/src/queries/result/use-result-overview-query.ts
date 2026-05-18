import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { resultOverviewService } from "@/services"
import {
  RESULT_QUERY_OPTIONS,
  shouldRetryOverviewQuery,
} from "@/queries/result/result-query-options"

export function useResultOverviewQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.overview(simulationId),
    queryFn: () => resultOverviewService.getOverview(simulationId),
    enabled: Boolean(simulationId),
    ...RESULT_QUERY_OPTIONS,
    retry: shouldRetryOverviewQuery,
    retryDelay: 1_500,
  })
}
