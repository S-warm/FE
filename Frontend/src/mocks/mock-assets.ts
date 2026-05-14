export const resultPageScreenshotUrl = "/mock-images/img-example-site.png"

export const resultPageScreenshotUrls = {
  login: "/mock-images/page-login.png",
  signup: "/mock-images/page-signup.png",
  main: "/mock-images/page-main.png",
  product: "/mock-images/page-product-detail.png",
  cart: "/mock-images/page-cart.png",
  checkout: resultPageScreenshotUrl,
  payment: resultPageScreenshotUrl,
  mypage: resultPageScreenshotUrl,
} as const

export function getResultPageScreenshotUrl(pageId?: string, fallback = resultPageScreenshotUrl) {
  if (!pageId) return fallback
  return resultPageScreenshotUrls[pageId as keyof typeof resultPageScreenshotUrls] ?? fallback
}
