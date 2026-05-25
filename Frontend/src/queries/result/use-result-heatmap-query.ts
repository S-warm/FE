import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import {
  RESULT_QUERY_OPTIONS,
  shouldRetryResultQuery,
} from "@/queries/result/result-query-options"
import { resultHeatmapService } from "@/services"
import type { GetResultHeatmapParams } from "@/services/result/result.types"

export function useResultHeatmapQuery(params: GetResultHeatmapParams) {
  const { simulationId, ageGroups, page, size } = params

  return useQuery({
    queryKey: queryKeys.results.heatmap({
      simulationId,
      ageGroups,
      page,
      size,
    }),
    queryFn: () => resultHeatmapService.getHeatmap(params),
    enabled: Boolean(simulationId),
    placeholderData: keepPreviousData,
    ...RESULT_QUERY_OPTIONS,
    retry: shouldRetryResultQuery,
  })
}
