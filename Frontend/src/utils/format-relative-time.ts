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
 * ISO 8601 타임스탬프�