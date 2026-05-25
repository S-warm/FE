export const RESULT_PAGE_SCREENSHOT_URL = "/mock-images/img-example-site.png"
export const RESULT_PAGE_SCREENSHOT_OPTIMIZED_URL = "/mock-images/optimized/img-example-site.jpg"
export const RESULT_PAGE_SCREENSHOT_PREVIEW_URL = "/mock-images/thumbs/img-example-site.jpg"

const RESULT_PAGE_SCREENSHOT_ASSETS = {
  login: {
    original: "/mock-images/page-login.png",
    full: "/mock-images/optimized/page-login.jpg",
    preview: "/mock-images/thumbs/page-login.jpg",
    expectedNaturalWidth: 3158,
    expectedNaturalHeight: 1588,
  },
  signup: {
    original: "/mock-images/page-signup.png",
    full: "/mock-images/optimized/page-signup.jpg",
    preview: "/mock-images/thumbs/page-signup.jpg",
    expectedNaturalWidth: 3158,
    expectedNaturalHeight: 1646,
  },
  search: {
    original: "/mock-images/page-search.png",
    full: "/mock-images/optimized/page-search.jpg",
    preview: "/mock-images/thumbs/page-search.jpg",
    expectedNaturalWidth: 3158,
    expectedNaturalHeight: 12308,
  },
  product: {
    original: "/mock-images/page-product-detail.png",
    full: "/mock-images/optimized/page-product-detail.jpg",
    preview: "/mock-images/thumbs/page-product-detail.jpg",
    expectedNaturalWidth: 3158,
    expectedNaturalHeight: 22191,
  },
} as const

const SOURCE_TO_ASSET = {
  [RESULT_PAGE_SCREENSHOT_URL]: {
    original: RESULT_PAGE_SCREENSHOT_URL,
    full: RESULT_PAGE_SCREENSHOT_OPTIMIZED_URL,
    preview: RESULT_PAGE_SCREENSHOT_PREVIEW_URL,
    expectedNaturalWidth: 3258,
    expectedNaturalHeight: 1734,
  },
  "/mock-images/page-login.png": RESULT_PAGE_SCREENSHOT_ASSETS.login,
  "/mock-images/page-signup.png": RESULT_PAGE_SCREENSHOT_ASSETS.signup,
  "/mock-images/page-search.png": RESULT_PAGE_SCREENSHOT_ASSETS.search,
  "/mock-images/page-product-detail.png": RESULT_PAGE_SCREENSHOT_ASSETS.product,
} as const

const FULL_TO_PREVIEW_URL = Object.entries(SOURCE_TO_ASSET).reduce<Record<string, string>>(
  (acc, [source, asset]) => {
    acc[source] = asset.preview
    acc[asset.full] = asset.preview
    return acc
  },
  Object.values(RESULT_PAGE_SCREENSHOT_ASSETS).reduce<Record<string, string>>((acc, asset) => {
    acc[asset.full] = asset.preview
    return acc
  }, {})
)

const SOURCE_TO_OPTIMIZED_URL = Object.entries(SOURCE_TO_ASSET).reduce<Record<string, string>>(
  (acc, [source, asset]) => {
    acc[source] = asset.full
    return acc
  },
  {}
)

export function getResultPageScreenshotUrl(
  pageId?: string,
  fallback = RESULT_PAGE_SCREENSHOT_OPTIMIZED_URL
) {
  if (!pageId) return fallback
  return RESULT_PAGE_SCREENSHOT_ASSETS[pageId as keyof typeof RESULT_PAGE_SCREENSHOT_ASSETS]?.full ?? fallback
}

export function getResultPageScreenshotPreviewUrl(
  pageId?: string,
  fallback = RESULT_PAGE_SCREENSHOT_PREVIEW_URL
) {
  if (!pageId) return fallback
  return RESULT_PAGE_SCREENSHOT_ASSETS[pageId as keyof typeof RESULT_PAGE_SCREENSHOT_ASSETS]?.preview ?? fallback
}

function resolveOptimizedScreenshotUrl(screenshotUrl: string) {
  return SOURCE_TO_OPTIMIZED_URL[screenshotUrl] ?? screenshotUrl
}

export function resolveResultPageScreenshotSet(input: {
  pageId?: string
  screenshotUrl?: string
}) {
  const screenshotUrl = input.screenshotUrl?.trim()

  if (screenshotUrl) {
    const optimizedFullUrl = resolveOptimizedScreenshotUrl(screenshotUrl)
    const matchedAsset = SOURCE_TO_ASSET[screenshotUrl as keyof typeof SOURCE_TO_ASSET]

    return {
      fullUrl: optimizedFullUrl,
      previewUrl:
        FULL_TO_PREVIEW_URL[screenshotUrl] ??
        FULL_TO_PREVIEW_URL[optimizedFullUrl] ??
        optimizedFullUrl,
      originalUrl: matchedAsset?.original ?? screenshotUrl,
      expectedNaturalWidth: matchedAsset?.expectedNaturalWidth,
      expectedNaturalHeight: matchedAsset?.expectedNaturalHeight,
    }
  }

  const matchedAsset =
    input.pageId
      ? RESULT_PAGE_SCREENSHOT_ASSETS[
          input.pageId as keyof typeof RESULT_PAGE_SCREENSHOT_ASSETS
        ]
      : undefined

  return {
    fullUrl: getResultPageScreenshotUrl(input.pageId),
    previewUrl: getResultPageScreenshotPreviewUrl(input.pageId),
    originalUrl: matchedAsset?.original ?? RESULT_PAGE_SCREENSHOT_URL,
    expectedNaturalWidth: matchedAsset?.expectedNaturalWidth,
    expectedNaturalHeight: matchedAsset?.expectedNaturalHeight,
  }
}
