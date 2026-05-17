/**
 * 수치 포맷팅 및 계산 유틸리티
 */

/**
 * 백분율 계산
 *
 * @param value - 부분값
 * @param total - 전체값
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @returns 백분율 (0~100)
 *
 * @example
 * calculatePercentage(30, 100)  // → 30
 * calculatePercentage(1, 3)     // → 33.3
 * calculatePercentage(0, 100)   // → 0
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals: number = 1
): number {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

/**
 * 수를 한국어 로케일로 포맷
 *
 * @param value - 포맷할 수
 * @returns 3자리 단위로 쉼표가 있는 문자열
 *
 * @example
 * formatNumber(1000)        // → "1,000"
 * formatNumber(1000000)     // → "1,000,000"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR")
}

/**
 * 초를 분/초 형식으로 포맷
 *
 * @param seconds - 초 단위 시간
 * @returns 분과 초를 조합한 한국어 문자열
 *
 * @example
 * formatDuration(0)    // → "0초"
 * formatDuration(45)   // → "45초"
 * formatDuration(60)   // → "1분"
 * formatDuration(65)   // → "1분 5초"
 * formatDuration(120)  // → "2분"
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) return `${remainingSeconds}초`
  if (remainingSeconds === 0) return `${minutes}분`
  return `${minutes}분 ${remainingSeconds}초`
}
