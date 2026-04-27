import { env } from "@/shared/config/env"
import type { ApiErrorResponse } from "@/shared/api/error-response"

export interface HttpClientOptions extends RequestInit {
  query?: Record<string, string | number | boolean | null | undefined>
}

export class HttpError extends Error {
  status: number
  statusText: string
  body: ApiErrorResponse | unknown

  constructor(status: number, statusText: string, body: ApiErrorResponse | unknown) {
    super(`HTTP ${status} ${statusText}`)
    this.name = "HttpError"
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

function buildUrl(path: string, query?: HttpClientOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${env.apiBaseUrl}${normalizedPath}`, window.location.origin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) return response.json()
  if (contentType.includes("text/")) return response.text()
  return null
}

export async function requestJson<T>(
  path: string,
  { query, headers, ...init }: HttpClientOptions = {}
) {
  const response = await fetch(buildUrl(path, query), {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...headers,
    },
    ...init,
  })

  const body = await parseResponse(response)
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText, body)
  }

  return body as T
}
