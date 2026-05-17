import { logger } from "@/lib/logger"
import { ApiServiceError } from "@/services"

/**
 * 에러 처리 컨텍스트 정보
 */
export interface ErrorContext {
  context: string
  userId?: string
  simulationId?: string
  endpoint?: string
  [key: string]: unknown
}

/**
 * 에러 처리 및 로깅 유틸리티
 *
 * 다양한 종류의 에러를 감지하여 사용자 친화적인 메시지를 제공하고,
 * 개발 환경과 프로덕션 환경에서 다르게 로깅합니다.
 */
export class ErrorHandler {
  /**
   * 에러 객체에서 사용자 친화적인 메시지 추출
   *
   * @param error - 에러 객체
   * @param defaultMessage - 기본 메시지 (선택사항)
   * @returns 사용자에게 표시할 메시지
   *
   * @example
   * const message = ErrorHandler.getErrorMessage(error, "기본 에러 메시지")
   */
  static getErrorMessage(error: unknown, defaultMessage?: string): string {
    if (error instanceof ApiServiceError) {
      // API 에러는 이미 사용자 친화적인 메시지
      return error.message
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return "네트워크 연결을 확인해주세요."
    }

    if (error instanceof SyntaxError) {
      return "데이터 형식이 올바르지 않습니다."
    }

    if (error instanceof Error) {
      // 개발 환경에서만 상세 메시지 표시
      if (import.meta.env.DEV) {
        logger.error("Error details:", error.message)
        return error.message
      }
      return (
        defaultMessage ||
        "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      )
    }

    return defaultMessage || "알 수 없는 오류가 발생했습니다."
  }

  /**
   * 에러 로깅
   *
   * 개발 환경에서는 콘솔에 출력하고,
   * 프로덕션 환경에서는 에러 트래킹 서비스로 전송할 수 있습니다.
   *
   * @param error - 에러 객체
   * @param context - 에러 발생 컨텍스트 정보
   *
   * @example
   * ErrorHandler.logError(error, {
   *   context: "SimulationSetup.createSimulation",
   *   userId: "user-123",
   * })
   */
  static logError(error: unknown, context: ErrorContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context: context.context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : String(error),
      metadata: { ...context },
    }

    if (import.meta.env.DEV) {
      logger.error("[ERROR LOG]", logEntry)
    }

    // TODO: 프로덕션 환경에서 에러 트래킹 서비스로 전송
    // if (import.meta.env.PROD) {
    //   errorTracking.captureException(error, { tags: context })
    // }
  }

  /**
   * 에러 처리 (메시지 추출 + 로깅)
   *
   * getErrorMessage와 logError를 함께 호출하는 편의 메서드
   *
   * @param error - 에러 객체
   * @param context - 에러 발생 컨텍스트 정보
   * @param defaultMessage - 기본 메시지 (선택사항)
   * @returns 사용자에게 표시할 메시지
   *
   * @example
   * try {
   *   await doSomething()
   * } catch (error) {
   *   const message = ErrorHandler.handle(error, {
   *     context: "MyComponent.doSomething",
   *     userId: auth.user?.id,
   *   })
   *   setError(message)
   * }
   */
  static handle(
    error: unknown,
    context: ErrorContext,
    defaultMessage?: string
  ): string {
    this.logError(error, context)
    return this.getErrorMessage(error, defaultMessage)
  }
}
