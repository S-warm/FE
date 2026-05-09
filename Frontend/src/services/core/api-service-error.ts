import type { ApiErrorResponse } from "@/types/api/common/api-error"

export class ApiServiceError extends Error {
  status: number
  error: string
  path: string

  constructor(payload: ApiErrorResponse) {
    super(payload.message)
    this.name = "ApiServiceError"
    this.status = payload.status
    this.error = payload.error
    this.path = payload.path
  }
}

export function createNotImplementedServiceError(path: string, message: string) {
  return new ApiServiceError({
    status: 501,
    error: "Not Implemented",
    message,
    path,
  })
}
