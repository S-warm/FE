import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { resultAiFixService } from "@/services"

export function useResultAiFixQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.aiFix(simulationId),
    queryFn: () => resultAiFixService.getAiFix(simulationId),
    enabled: Boolean(simulationId),
  })
}
