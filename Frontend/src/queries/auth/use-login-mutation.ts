import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authService } from "@/services"
import { useAuthStore } from "@/store/auth.store"
import type {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
} from "@/types/api/auth"

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)

  return useMutation<AuthLoginResponseDto, unknown, AuthLoginRequestDto>({
    mutationFn: (input) => authService.login(input),
    onSuccess: async (response, variables) => {
      const user = response.user ?? {
        username: variables.username,
      }
      login(user, response.accessToken)
      await queryClient.invalidateQueries()
    },
  })
}
