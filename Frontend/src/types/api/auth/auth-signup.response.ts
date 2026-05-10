import type { AuthLoginResponseDto } from "@/types/api/auth/auth-login.response"

/**
 * 회원가입 응답 DTO.
 * 가정값: signup 성공 시 곧바로 token 을 발급해 자동 로그인 흐름까지 이어준다.
 * BE 가 signup 후 별도 로그인 요청을 요구한다면 token 필드를 옵셔널로 두고
 * mutation 의 onSuccess 에서 분기 처리한다.
 */
export type AuthSignupResponseDto = AuthLoginResponseDto
