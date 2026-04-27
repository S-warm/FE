import mockScreenshot from "@/assets/mocks/img-example-site.png"

export function buildResultPageId(order: number, pageName: string) {
  const normalizedName = pageName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")

  return normalizedName ? `page-${order}-${normalizedName}` : `page-${order}`
}

export function resolveResultScreenshotUrl(screenshotUrl: string) {
  return screenshotUrl.trim() || mockScreenshot
}
