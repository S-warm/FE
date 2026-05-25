import { ApiServiceError } from "@/services/core/api-service-error"
import { SERVICE_CONFIG } from "@/services/core/service-config"

const PUBLIC_JSON_TIMEOUT_MS = 15_000

function buildPublicJsonUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const origin =
    typeof window !== "undefined" ? window.location.origin : SERVICE_CONFIG.appOrigin

  return new URL(normalizedPath, origin).toString()
}

export async function requestPublicJson<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    PUBLIC_JSON_TIMEOUT_MS,
  )

  try {
    const response = await fetch(buildPublicJsonUrl(path), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new ApiServiceError({
        status: response.status,
        error: "Public Mock Load Failed",
        message: `${path} mock JSON을 불러오지 못했습니다.`,
        path,
      })
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiServiceError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiServiceError({
        status: 408,
        error: "Public Mock Timeout",
        message: `${path} mock JSON 로딩이 시간 초과되었습니다.`,
        path,
      })
    }

    throw new ApiServiceError({
      status: 500,
      error: "Public Mock Error",
      message:
        error instanceof Error
          ? error.message
          : `${path} mock JSON을 읽는 중 알 수 없는 오류가 발생했습니다.`,
      path,
    })
  } finally {
    globalThis.clearTimeout(timeoutId)
  }
}
