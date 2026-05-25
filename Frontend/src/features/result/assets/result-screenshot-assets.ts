function trimToUndefined(value?: string | null) {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : undefined
}

function normalizeScreenshotUrl(screenshotUrl?: string | null) {
  const normalizedUrl = trimToUndefined(screenshotUrl)
  if (!normalizedUrl) {
    return undefined
  }

  return normalizedUrl
}

export function resolveResultPageScreenshotSet(input: {
  pageId?: string
  screenshotUrl?: string | null
}) {
  void input.pageId

  const normalizedScreenshotUrl = normalizeScreenshotUrl(input.screenshotUrl)

  return {
    fullUrl: normalizedScreenshotUrl,
    previewUrl: normalizedScreenshotUrl,
    originalUrl: normalizedScreenshotUrl,
    expectedNaturalWidth: undefined,
    expectedNaturalHeight: undefined,
  }
}
