/**
 * 입력 검증 유틸리티
 */

/**
 * HTTP/HTTPS URL 검증
 *
 * @param value - 검증할 URL
 * @returns 유효한 HTTP(S) URL인지 여부
 *
 * @example
 * isValidHttpUrl("https://example.com")  // → true
 * isValidHttpUrl("ftp://example.com")    // → false
 * isValidHttpUrl("")                     // → false
 */
export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    return ["http:", "https:"].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * 페르소나 수 분배 유효성 검증
 *
 * 모든 연령대의 페르소나 수가 0 이상의 정수이고,
 * 총합이 1명 이상인지 확인합니다.
 *
 * @param counts - 연령대별 페르소나 수
 * @returns 유효한 페르소나 분배인지 여부
 *
 * @example
 * isValidPersonaDistribution({
 *   teens: 10,
 *   twenties: 20,
 * })  // → true (총 30명)
 *
 * isValidPersonaDistribution({
 *   teens: 0,
 *   twenties: 0,
 * })  // → false (총 0명)
 */
export function isValidPersonaDistribution(
  counts: Record<string, number>
): boolean {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    total > 0 &&
    Object.values(counts).every(
      (count) =>
        Number.isInteger(count) && count >= 0 && Number.isFinite(count)
    )
  )
}

/**
 * 범위 내 정수 검증
 *
 * @param value - 검증할 값
 * @param min - 최소값 (포함)
 * @param max - 최대값 (포함)
 * @returns 범위 내 정수인지 여부
 *
 * @example
 * isValidRange(50, 0, 100)   // → true
 * isValidRange(101, 0, 100)  // → false
 * isValidRange(50.5, 0, 100) // → false (정수 아님)
 */
export function isValidRange(
  value: number,
  min: number,
  max: number
): boolean {
  return (
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  )
}

/**
 * 시력 저하 값 검증 (0~100)
 *
 * @param value - 검증할 시력 저하 값
 * @returns 0~100 범위의 정수인지 여부
 *
 * @example
 * isValidVisionImpairment(50)   // → true
 * isValidVisionImpairment(101)  // → false
 */
export function isValidVisionImpairment(value: number): boolean {
  return isValidRange(value, 0, 100)
}

/**
 * 주의력 값 검증 (0~100)
 *
 * @param value - 검증할 주의력 값
 * @returns 0~100 범위의 정수인지 여부
 *
 * @example
 * isValidAttentionLevel(50)   // → true
 * isValidAttentionLevel(-1)   // → false
 */
export function isValidAttentionLevel(value: number): boolean {
  return isValidRange(value, 0, 100)
}
