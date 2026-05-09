import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { resultIssuesService } from "@/services"

export function useResultIssuesQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.issues(simulationId),
    queryFn: () => resultIssuesService.getIssues(simulationId),
    enabled: Boolean(simulationId),
  })
}
