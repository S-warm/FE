import { ApiServiceError } from "@/services/core/api-service-error"

export const RESULT_QUERY_OPTIONS = {
  staleTime: 5 * 60_000,
  gcTime: 10 * 60_000,
} as const

export function shouldRetryResultQuery(failureCount: number, error: unknown) {
  if (error instanceof ApiServiceError && error.status >= 400 && error.status < 500) {
    return false
  }

  return failureCount < 2
}
