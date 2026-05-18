import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import {
  RESULT_QUERY_OPTIONS,
  shouldRetryResultQuery,
} from "@/queries/result/result-query-options"
import { resultWcagService } from "@/services"

export function useResultWcagQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.wcag(simulationId),
    queryFn: () => resultWcagService.getWcag(simulationId),
    enabled: Boolean(simulationId),
    ...RESULT_QUERY_OPTIONS,
    retry: shouldRetryResultQuery,
  })
}
