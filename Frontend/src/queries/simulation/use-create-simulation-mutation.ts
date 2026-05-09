import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { SERVICE_CONFIG, simulationService } from "@/services"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"

export function useCreateSimulationMutation(
  userId = SERVICE_CONFIG.defaultUserId,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SimulationCreateRequestDto) =>
      simulationService.createSimulation(input, userId),
    onSuccess: async () => {
      if (!userId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.simulations.all,
      })
    },
  })
}
