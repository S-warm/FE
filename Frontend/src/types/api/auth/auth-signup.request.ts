/**
 * 회원가입 요청 DTO.
 * 가정값:
 * - username, password 는 필수
 * - confirmPassword 는 클라이언트 검증용 (BE 로 보내지 않음)
 */
export interface AuthSignupRequestDto {
  username: string
  password: string
}
