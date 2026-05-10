import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authService } from "@/services"
import { useAuthStore } from "@/store/auth.store"
import type {
  AuthSignupRequestDto,
  AuthSignupResponseDto,
} from "@/types/api/auth"

/**
 * 회원가입 mutation.
 * 가정값: signup 응답이 곧바로 accessToken 을 포함하므로 자동 로그인까지 처리한다.
 * BE 가 별도 로그인 단계를 요구하면 onSuccess 에서 navigate(routes.login) 으로 분기한다.
 */
export function useSignupMutation() {
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)

  return useMutation<AuthSignupResponseDto, unknown, AuthSignupRequestDto>({
    mutationFn: (input) => authService.signup(input),
    onSuccess: async (response, variables) => {
      if (response.accessToken) {
        const username = response.user?.username ?? variables.username
        login(username, response.accessToken)
        await queryClient.invalidateQueries()
      }
    },
  })
}
