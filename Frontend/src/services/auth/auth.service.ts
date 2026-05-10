import type {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthMeResponseDto,
  AuthRefreshResponseDto,
  AuthSignupRequestDto,
  AuthSignupResponseDto,
} from "@/types/api/auth"

/**
 * 인증 서비스 인터페이스.
 *
 * mock 구현체는 기존 admin / 123 더미 흐름을 흡수하고,
 * http 구현체는 src/services/core/http-client.ts 만 사용해서 BE 와 통신한다.
 *
 * Step 17 단계에서는 refresh / me 도 인터페이스만 마련해 두고
 * 실제 자동 갱신은 다음 단계에서 붙인다.
 */
export interface AuthService {
  login(input: AuthLoginRequestDto): Promise<AuthLoginResponseDto>
  signup(input: AuthSignupRequestDto): Promise<AuthSignupResponseDto>
  refresh(): Promise<AuthRefreshResponseDto>
  me(): Promise<AuthMeResponseDto>
}
