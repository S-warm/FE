import { useState, useCallback } from "react"

/**
 * 폼 에러 상태 관리 Hook 반환 타입
 */
export interface UseFormErrorsReturn<T> {
  errors: T
  setError: (field: keyof T, message?: string) => void
  clearError: (field: keyof T) => void
  clearAllErrors: () => void
  setErrors: (errors: T) => void
  hasErrors: () => boolean
  hasError: (field: keyof T) => boolean
}

/**
 * 폼 에러 상태 관리 Hook
 *
 * 폼의 검증 에러를 중앙화하여 관리하고,
 * 필드별 에러 설정/제거/조회 기능을 제공합니다.
 *
 * @template T - 폼 에러 타입 (Record<string, string | undefined>)
 * @param initialErrors - 초기 에러 값 (선택사항)
 * @returns 에러 상태 및 핸들러 함수들
 *
 * @example
 * const { errors, setError, clearError } = useFormErrors<MyFormErrors>()
 * clearError("email")
 * hasError("password") // boolean
 */
export function useFormErrors<T extends Record<string, string | undefined>>(
  initialErrors?: T
): UseFormErrorsReturn<T> {
  const [errors, setErrors] = useState<T>(initialErrors ?? ({} as T))

  const setError = useCallback((field: keyof T, message?: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }))
  }, [])

  const clearError = useCallback(
    (field: keyof T) => {
      setError(field, undefined)
    },
    [setError]
  )

  const clearAllErrors = useCallback(() => {
    setErrors({} as T)
  }, [])

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(Boolean)
  }, [errors])

  const hasError = useCallback(
    (field: keyof T) => {
      return Boolean(errors[field])
    },
    [errors]
  )

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    setErrors,
    hasErrors,
    hasError,
  }
}
