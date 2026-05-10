/**
 * 토큰 갱신 응답 DTO.
 * 가정값: refresh 는 새 accessToken 만 돌려주고 user 는 그대로 사용.
 * BE 가 user 를 함께 반환한다면 옵셔널 필드로 확장.
 */
export interface AuthRefreshResponseDto {
  accessToken: string
  tokenType?: string
  expiresIn?: number
  refreshToken?: string
}
