import type { AuthUserDto } from "@/types/api/auth/auth-user"

/**
 * 로그인 응답 DTO.
 * 가정값:
 * - accessToken: Bearer 토큰 본문
 * - tokenType: 일반적으로 "Bearer" — 미정이면 클라이언트가 무시
 * - expiresIn: 초 단위 만료. 클라이언트가 silent refresh 타이머에 사용 (Step 17 에서는 미사용)
 * - user: 사용자 메타. UI 의 initials / username 을 채우는 단일 출처
 *
 * refreshToken 은 cookie 기반이라면 이 응답에 노출되지 않을 수 있다 — 옵셔널로 둔다.
 */
export interface AuthLoginResponseDto {
  accessToken: string
  tokenType?: string
  expiresIn?: number
  refreshToken?: string
  user: AuthUserDto
}
