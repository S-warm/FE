import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/queries/query-keys"
import { SERVICE_CONFIG, simulationService, createNotImplementedServiceError } from "@/services"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"

export function useCreateSimulationMutation(
  userId = SERVICE_CONFIG.defaultUserId,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SimulationCreateRequestDto) => {
      const resolvedUserId = userId.trim()

      if (!resolvedUserId) {
        throw createNotImplementedServiceError(
          "/api/simulations",
          "실제 API 연동 모드에서는 VITE_DEFAULT_USER_ID 설정이 필요합니다."
        )
      }

      return simulationService.createSimulation(input, resolvedUserId)
    },
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
