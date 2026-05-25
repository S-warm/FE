function trimToUndefined(value?: string | null) {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function deriveResultPageName(pageUrl?: string, fallback = "페이지") {
  const normalizedFallback = trimToUndefined(fallback) ?? "페이지"
  const normalizedUrl = trimToUndefined(pageUrl)

  if (!normalizedUrl) {
    return normalizedFallback
  }

  try {
    const pathname = new URL(normalizedUrl).pathname
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments.at(-1)

    if (!lastSegment) {
      return normalizedFallback
    }

    return decodeURIComponent(lastSegment.startsWith("/") ? lastSegment : `/${lastSegment}`)
  } catch {
    return normalizedUrl
  }
}

export function normalizeResultScreenshotUrl(screenshotUrl?: string | null) {
  const normalizedUrl = trimToUndefined(screenshotUrl)

  if (!normalizedUrl) {
    return undefined
  }

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl
  }

  if (normalizedUrl.startsWith("//")) {
    return `https:${normalizedUrl}`
  }

  if (normalizedUrl.startsWith("/")) {
    return normalizedUrl
  }

  return `/${normalizedUrl.replace(/^\.?\//, "")}`
}
