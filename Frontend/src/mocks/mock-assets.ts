export const resultPageScreenshotUrl = "/mock-images/img-example-site.png"

export const resultPageScreenshotUrls = {
  login: resultPageScreenshotUrl,
  signup: resultPageScreenshotUrl,
  main: resultPageScreenshotUrl,
  product: resultPageScreenshotUrl,
  cart: resultPageScreenshotUrl,
  checkout: resultPageScreenshotUrl,
  payment: resultPageScreenshotUrl,
  mypage: resultPageScreenshotUrl,
} as const

export function getResultPageScreenshotUrl(pageId?: string, fallback = resultPageScreenshotUrl) {
  if (!pageId) return fallback
  return resultPageScreenshotUrls[pageId as keyof typeof resultPageScreenshotUrls] ?? fallback
}
