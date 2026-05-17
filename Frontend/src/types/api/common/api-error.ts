export interface ApiErrorResponse {
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: Array<{
    path: string
    message: string
  }>
}
