import type { AuthUserDto } from "@/types/api/auth/auth-user"

/**
 * 현재 세션 사용자 정보 응답 DTO.
 * /auth/me 가 요구되면 user 단일 필드로 응답한다고 가정한다.
 */
export interface AuthMeResponseDto {
  user: AuthUserDto
}
