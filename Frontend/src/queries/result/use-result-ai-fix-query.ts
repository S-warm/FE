import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import {
  RESULT_QUERY_OPTIONS,
  shouldRetryResultQuery,
} from "@/queries/result/result-query-options"
import { resultAiFixService } from "@/services"

export function useResultAiFixQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.aiFix(simulationId),
    queryFn: () => resultAiFixService.getAiFix(simulationId),
    enabled: Boolean(simulationId),
    ...RESULT_QUERY_OPTIONS,
    retry: shouldRetryResultQuery,
  })
}
