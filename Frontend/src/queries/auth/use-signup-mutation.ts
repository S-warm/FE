import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authService } from "@/services"
import { useAuthStore } from "@/store/auth.store"
import type {
  AuthSignupRequestDto,
  AuthSignupResponseDto,
} from "@/types/api/auth"

export function useSignupMutation() {
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)

  return useMutation<AuthSignupResponseDto, unknown, AuthSignupRequestDto>({
    mutationFn: (input) => authService.signup(input),
    onSuccess: async (response, variables) => {
      if (response.accessToken) {
        const user = response.user ?? {
          username: variables.username,
        }
        login(user, response.accessToken)
        await queryClient.invalidateQueries()
      }
    },
  })
}
