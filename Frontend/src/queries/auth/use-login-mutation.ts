import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authService } from "@/services"
import { useAuthStore } from "@/store/auth.store"
import type {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
} from "@/types/api/auth"

/**
 * 로그인 mutation.
 * 성공 시 auth.store 단일 출처에 token 까지 함께 저장한다.
 * (Authorization 헤더는 http-client 가 store 에서 token 을 읽어 자동 주입한다.)
 */
export function useLoginMutation() {
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)

  return useMutation<AuthLoginResponseDto, unknown, AuthLoginRequestDto>({
    mutationFn: (input) => authService.login(input),
    onSuccess: async (response, variables) => {
      const username = response.user?.username ?? variables.username
      login(username, response.accessToken)
      // 로그인 직후 simulation 목록 / header 캐시는 새 사용자 컨텍스트 기준으로 새로 받는다.
      await queryClient.invalidateQueries()
    },
  })
}
