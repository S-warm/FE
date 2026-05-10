/**
 * 로그인 요청 DTO.
 * 가정값: BE 가 username + password 로 받음.
 * (이메일 기반이면 BE 합의 후 username -> email 로 키 변경)
 */
export interface AuthLoginRequestDto {
  username: string
  password: string
}
