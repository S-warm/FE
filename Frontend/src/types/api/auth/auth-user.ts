/**
 * BE 인증 사용자 DTO.
 * BE 명세 미정 부분은 가정값으로 잡고 실제 응답이 확정되면 정렬한다.
 *
 * 가정값:
 * - id: 서버 생성 UUID 문자열
 * - username: 로그인 아이디 (이메일이 아닐 수 있음 — 페이지 placeholder 가 "아이디" 임)
 * - displayName: UI 표기용 (없으면 username 으로 fallback)
 * - initials: 사이드바 / 헤더의 둥근 아바타에 표시할 두 글자
 */
export interface AuthUserDto {
  id: string
  username: string
  displayName?: string
  initials?: string
}
