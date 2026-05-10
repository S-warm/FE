import { httpClient } from "@/services/core/http-client"
import type {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthMeResponseDto,
  AuthRefreshResponseDto,
  AuthSignupRequestDto,
  AuthSignupResponseDto,
} from "@/types/api/auth"
import type { AuthService } from "@/services/auth/auth.service"

/**
 * BE 인증 API 본체.
 *
 * 가정 엔드포인트 (BE 명세 확정 시 즉시 교체):
 * - POST /auth/login   → AuthLoginResponseDto
 * - POST /auth/signup  → AuthSignupResponseDto
 * - POST /auth/refresh → AuthRefreshResponseDto  (refreshToken 은 httpOnly cookie 가정)
 * - GET  /auth/me      → AuthMeResponseDto
 *
 * Authorization 헤더는 httpClient 가 auth.store.token 을 자동 주입한다.
 * 401 응답은 httpClient 가 useAuthStore.logout() 을 호출한 뒤 ApiServiceError 를 throw 한다.
 */
export const authHttpService: AuthService = {
  login(input: AuthLoginRequestDto) {
    return httpClient.post<AuthLoginResponseDto>("/auth/login", input)
  },

  signup(input: AuthSignupRequestDto) {
    return httpClient.post<AuthSignupResponseDto>("/auth/signup", input)
  },

  refresh() {
    return httpClient.post<AuthRefreshResponseDto>("/auth/refresh")
  },

  me() {
    return httpClient.get<AuthMeResponseDto>("/auth/me")
  },
}
