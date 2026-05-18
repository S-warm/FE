function formatRelativeTime(input: string | Date, now: Date = new Date()) {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return "-"

  const diffMs = now.getTime() - date.getTime()
  const absMs = Math.abs(diffMs)
  const isFuture = diffMs < 0

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (absMs < 30 * 1000) return "방금 전"

  if (absMs < hour) {
    const minutes = Math.max(1, Math.round(absMs / minute))
    return isFuture ? `${minutes}분 후` : `${minutes}분 전`
  }

  if (absMs < day) {
    const hours = Math.max(1, Math.round(absMs / hour))
    return isFuture ? `${hours}시간 후` : `${hours}시간 전`
  }

  const days = Math.max(1, Math.round(absMs / day))
  return isFuture ? `${days}일 후` : `${days}일 전`
}

/**
 * ISO 8601 타임스탬프를 가독성 있는 형식으로 변환한다.
 * @param input ISO 8601 형식의 문자열 또는 Date 객체
 * @param locale 로케일 설정 ('ko' = 한국어, 'en' = ISO 형식)
 * @returns 포맷된 날짜 시간 문자열
 * @example
 * formatDateTime('2026-05-17T15:17:34.004Z', 'ko') // "2026년 5월 17일 15:17"
 * formatDateTime('2026-05-17T15:17:34.004Z', 'en') // "2026-05-17 15:17"
 */
function formatDateTime(input: string | Date, locale: "ko" | "en" = "ko"): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return "-"

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  if (locale === "ko") {
    return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 ${hours}:${minutes}`
  }

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export { formatDateTime, formatRelativeTime }
