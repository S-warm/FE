export const RESULT_PAGE_SCREENSHOT_URL = "/mock-images/img-example-site.png"

export const RESULT_PAGE_SCREENSHOT_URLS = {
  login: "/mock-images/page-login.png",
  signup: "/mock-images/page-signup.png",
  main: "/mock-images/page-main.png",
  search: "/mock-images/page-search.png",
  product: "/mock-images/page-product-detail.png",
  cart: "/mock-images/page-cart.png",
  checkout: RESULT_PAGE_SCREENSHOT_URL,
  payment: RESULT_PAGE_SCREENSHOT_URL,
  mypage: RESULT_PAGE_SCREENSHOT_URL,
} as const

export function getResultPageScreenshotUrl(
  pageId?: string,
  fallback = RESULT_PAGE_SCREENSHOT_URL
) {
  if (!pageId) return fallback
  return RESULT_PAGE_SCREENSHOT_URLS[pageId as keyof typeof RESULT_PAGE_SCREENSHOT_URLS] ?? fallback
}
