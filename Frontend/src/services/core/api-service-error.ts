import type { ApiErrorResponse } from "@/types/api/common/api-error"

export class ApiServiceError extends Error {
  status: number
  error: string
  path: string
  fieldErrors?: Array<{
    path: string
    message: string
  }>

  constructor(payload: ApiErrorResponse) {
    super(payload.message)
    this.name = "ApiServiceError"
    this.status = payload.status
    this.error = payload.error
    this.path = payload.path
    this.fieldErrors = payload.fieldErrors
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
