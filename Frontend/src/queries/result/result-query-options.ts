import { ApiServiceError } from "@/services/core/api-service-error"

export const RESULT_QUERY_OPTIONS = {
  staleTime: 5 * 60_000,
  gcTime: 10 * 60_000,
} as const

function isResultNotFoundError(error: unknown) {
  return error instanceof ApiServiceError && error.status === 404
}

export function shouldRetryResultQuery(failureCount: number, error: unknown) {
  if (error instanceof ApiServiceError && error.status >= 400 && error.status < 500) {
    return false
  }

  return failureCount < 2
}

export function shouldRetryOverviewQuery(failureCount: number, error: unknown) {
  if (isResultNotFoundError(error)) {
    return failureCount < 8
  }

  return shouldRetryResultQuery(failureCount, error)
}
