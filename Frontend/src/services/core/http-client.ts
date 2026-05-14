import { useAuthStore } from "@/store/auth.store"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import { ApiServiceError } from "@/services/core/api-service-error"
import type { ApiErrorResponse } from "@/types/api/common/api-error"

type Primitive = string | number | boolean

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: BodyInit | object | null
  headers?: Record<string, string>
  query?: Record<string, Primitive | null | undefined>
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    `${normalizeBaseUrl(SERVICE_CONFIG.apiBaseUrl)}${normalizePath(path)}`
  )

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined) return
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function unwrapPayload<T>(payload: unknown): T {
  if (!isPlainObject(payload)) {
    return payload as T
  }

  if ("data" in payload) {
    return payload.data as T
  }

  if ("result" in payload) {
    return payload.result as T
  }

  if ("payload" in payload) {
    return payload.payload as T
  }

  return payload as T
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  if (isPlainObject(payload) && typeof payload.message === "string") {
    return payload.message
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload
  }

  return fallback
}

function toApiErrorPayload(
  path: string,
  response: Response,
  payload: unknown
): ApiErrorResponse {
  const fieldErrors =
    isPlainObject(payload) && Array.isArray(payload.fieldErrors)
      ? payload.fieldErrors
          .filter(
            (item): item is { path: string; message: string } =>
              isPlainObject(item) &&
              typeof item.path === "string" &&
              typeof item.message === "string"
          )
      : undefined

  return {
    status: response.status,
    error:
      (isPlainObject(payload) && typeof payload.error === "string"
        ? payload.error
        : response.statusText) || "Request Failed",
    message: resolveErrorMessage(
      payload,
      "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    ),
    path:
      (isPlainObject(payload) && typeof payload.path === "string"
        ? payload.path
        : path) || path,
    fieldErrors,
  }
}

function buildHeaders(customHeaders?: Record<string, string>) {
  const token =
    useAuthStore.getState().accessToken ??
    import.meta.env.VITE_API_ACCESS_TOKEN ??
    null

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...customHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

function serializeBody(body: RequestOptions["body"]) {
  if (body === undefined) return undefined
  if (body === null) return null
  if (body instanceof FormData || body instanceof URLSearchParams) return body
  if (typeof body === "string") return body

  return JSON.stringify(body)
}

function withContentType(
  headers: Record<string, string>,
  body: RequestOptions["body"]
) {
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !("Content-Type" in headers)
  ) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}

export async function requestJson<T>(path: string, options: RequestOptions = {}) {
  const headers = withContentType(buildHeaders(options.headers), options.body)
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body: serializeBody(options.body),
  })
  const payload = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiServiceError(toApiErrorPayload(path, response, payload))
  }

  return unwrapPayload<T>(payload)
}

export async function requestJsonWithFallback<T>(
  paths: string[],
  options: RequestOptions = {}
) {
  let lastError: unknown

  for (const path of paths) {
    try {
      return await requestJson<T>(path, options)
    } catch (error) {
      lastError = error

      if (!(error instanceof ApiServiceError) || error.status !== 404) {
        throw error
      }
    }
  }

  throw lastError
}
