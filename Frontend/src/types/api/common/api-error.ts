export interface ApiFieldErrorResponse {
  field?: string
  path?: string
  message: string
}

export interface ApiErrorResponse {
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: ApiFieldErrorResponse[]
}
