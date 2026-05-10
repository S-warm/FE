import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { SERVICE_CONFIG, simulationService } from "@/services"
import { useAuthStore } from "@/store/auth.store"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"

export function useCreateSimulationMutation(userId?: string) {
  const queryClient = useQueryClient()
  const authenticatedUserId = useAuthStore((state) => state.user?.id)
  const resolvedUserId =
    userId ?? authenticatedUserId ?? SERVICE_CONFIG.defaultUserId

  return useMutation({
    mutationFn: (input: SimulationCreateRequestDto) =>
      simulationService.createSimulation(input, resolvedUserId),
    onSuccess: async () => {
      if (!resolvedUserId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.simulations.all,
      })
    },
  })
}
