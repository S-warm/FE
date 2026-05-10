import { ApiServiceError } from "@/services/core/api-service-error"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import { useAuthStore } from "@/store/auth.store"
import type { ApiErrorResponse } from "@/types/api/common/api-error"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

type QueryValue = string | number | boolean | null | undefined

export interface HttpRequestOptions {
  query?: Record<string, QueryValue>
  signal?: AbortSignal
  headers?: Record<string, string>
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

function trimLeadingSlash(value: string): string {
  return value.startsWith("/") ? value.slice(1) : value
}

function buildUrl(path: string, query?: HttpRequestOptions["query"]): string {
  const base = trimTrailingSlash(SERVICE_CONFIG.apiBaseUrl)
  const normalizedPath = trimLeadingSlash(path)
  const url = `${base}/${normalizedPath}`

  if (!query) return url

  const search = new URLSearchParams()
  for (const [key, raw] of Object.entries(query)) {
    if (raw === null || raw === undefined) continue
    search.append(key, String(raw))
  }

  const searchString = search.toString()
  return searchString.length > 0 ? `${url}?${searchString}` : url
}

function readAuthToken(): string | null {
  const user = useAuthStore.getState().user
  return user?.token ?? null
}

function buildHeaders(extra?: Record<string, string>): Headers {
  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  headers.set("Accept", "application/json")

  const token = readAuthToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      headers.set(key, value)
    }
  }

  return headers
}

async function parseErrorPayload(
  response: Response,
  path: string,
): Promise<ApiErrorResponse> {
  let payload: Partial<ApiErrorResponse> | null = null

  try {
    const text = await response.clone().text()
    if (text.length > 0) {
      payload = JSON.parse(text) as Partial<ApiErrorResponse>
    }
  } catch {
    payload = null
  }

  return {
    status: payload?.status ?? response.status,
    error: payload?.error ?? response.statusText ?? "Error",
    message: payload?.message ?? "요청 처리 중 오류가 발생했습니다.",
    path: payload?.path ?? path,
  }
}

async function parseSuccessBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    // JSON 이 아닌 응답은 raw text 로 반환한다 (PDF / CSV 다운로드 등 향후 확장 여지).
    return text as unknown as T
  }
}

async function dispatch<T>(
  method: HttpMethod,
  path: string,
  body: unknown,
  options: HttpRequestOptions,
): Promise<T> {
  const url = buildUrl(path, options.query)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(options.headers),
      body: body === undefined || method === "GET" ? undefined : JSON.stringify(body),
      signal: options.signal,
    })
  } catch (cause) {
    throw new ApiServiceError({
      status: 0,
      error: "Network Error",
      message:
        cause instanceof Error
          ? cause.message
          : "네트워크 요청에 실패했습니다.",
      path,
    })
  }

  if (!response.ok) {
    if (response.status === 401) {
      try {
        useAuthStore.getState().logout()
      } catch {
        // logout 자체 실패가 원본 에러를 가리지 않도록 silent fail
      }
    }

    const payload = await parseErrorPayload(response, path)
    throw new ApiServiceError(payload)
  }

  return parseSuccessBody<T>(response)
}

export const httpClient = {
  get<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    return dispatch<T>("GET", path, undefined, options)
  },
  post<T>(
    path: string,
    body?: unknown,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    return dispatch<T>("POST", path, body, options)
  },
  put<T>(
    path: string,
    body?: unknown,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    return dispatch<T>("PUT", path, body, options)
  },
  delete<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    return dispatch<T>("DELETE", path, undefined, options)
  },
} as const

export type HttpClient = typeof httpClient
