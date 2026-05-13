# 📝 FE Code Refactoring - Before & After Examples

**목적**: FE 코드 리뷰 보고서의 구체적인 개선 사항을 코드 예시로 제시

---

## 1. Custom Hook 추출

### 1-1. useSimulationDraft() - 상태 선택자 통합

#### ❌ Before (SimulationSetupPage.tsx, 10줄 반복)
```typescript
const targetUrl = useSimulationDraftStore((state) => state.targetUrl)
const setTargetUrl = useSimulationDraftStore((state) => state.setTargetUrl)
const endUrl = useSimulationDraftStore((state) => state.endUrl)
const setEndUrl = useSimulationDraftStore((state) => state.setEndUrl)
const projectTitle = useSimulationDraftStore((state) => state.projectTitle)
const setProjectTitle = useSimulationDraftStore((state) => state.setProjectTitle)
const startedAt = useSimulationDraftStore((state) => state.startedAt)
const setStartedAt = useSimulationDraftStore((state) => state.setStartedAt)
const personaDevice = useSimulationDraftStore((state) => state.personaDevice)
const setPersonaDevice = useSimulationDraftStore((state) => state.setPersonaDevice)
```

#### ✅ After

**파일: `src/hooks/useSimulationDraft.ts`**
```typescript
import { useShallow } from "zustand/react"
import { useSimulationDraftStore } from "@/store/simulation-draft.store"

export function useSimulationDraft() {
  return useSimulationDraftStore(
    useShallow((state) => ({
      targetUrl: state.targetUrl,
      setTargetUrl: state.setTargetUrl,
      endUrl: state.endUrl,
      setEndUrl: state.setEndUrl,
      projectTitle: state.projectTitle,
      setProjectTitle: state.setProjectTitle,
      startedAt: state.startedAt,
      setStartedAt: state.setStartedAt,
      personaDevice: state.personaDevice,
      setPersonaDevice: state.setPersonaDevice,
    }))
  )
}
```

**사용: `src/pages/SimulationSetupPage.tsx`**
```typescript
// Before: 10줄
const targetUrl = useSimulationDraftStore((state) => state.targetUrl)
// ...

// After: 1줄
const draft = useSimulationDraft()

// 접근
draft.targetUrl      // → state.targetUrl
draft.setTargetUrl   // → state.setTargetUrl
```

**개선 효과:**
- ✅ 코드 라인 10줄 → 1줄
- ✅ 리렌더링 최적화 (useShallow)
- ✅ 재사용 가능한 Hook

---

### 1-2. useFormErrors<T>() - 폼 에러 관리 통합

#### ❌ Before (SimulationSetupPage.tsx, 반복된 패턴)
```typescript
const [errors, setErrors] = useState<SimulationSetupValidationErrors>({})

const resetValidationErrors = () => {
  setErrors({})
}

// 필드마다 반복
setErrors((prev) => ({ ...prev, projectTitle: undefined }))
setErrors((prev) => ({ ...prev, targetUrl: undefined }))
setErrors((prev) => ({ ...prev, endUrl: undefined }))
// ...

// 사용
resetValidationErrors()
```

#### ✅ After

**파일: `src/hooks/useFormErrors.ts`**
```typescript
import { useState, useCallback } from "react"

interface UseFormErrorsReturn<T> {
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
 * @example
 * const { errors, setError, clearError } = useFormErrors<MyFormErrors>()
 * clearError("email")
 */
export function useFormErrors<T extends Record<string, string | undefined>>(
  initialErrors?: T
): UseFormErrorsReturn<T> {
  const [errors, setErrors] = useState<T>(initialErrors ?? ({} as T))

  const setError = useCallback((field: keyof T, message?: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }))
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setError(field, undefined)
  }, [setError])

  const clearAllErrors = useCallback(() => {
    setErrors({} as T)
  }, [])

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(Boolean)
  }, [errors])

  const hasError = useCallback((field: keyof T) => {
    return Boolean(errors[field])
  }, [errors])

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
```

**사용: `src/pages/SimulationSetupPage.tsx`**
```typescript
// Before: 20줄 이상
const [errors, setErrors] = useState<SimulationSetupValidationErrors>({})
const resetValidationErrors = () => setErrors({})
setErrors((prev) => ({ ...prev, projectTitle: undefined }))

// After: 1줄
const { errors, setError, clearError, clearAllErrors } = 
  useFormErrors<SimulationSetupValidationErrors>()

// 사용
clearError("projectTitle")        // 특정 필드 에러 제거
clearAllErrors()                  // 모든 에러 제거
setError("email", "Invalid email") // 에러 설정

// 입력 필드에서
onChange={(event) => {
  setProjectTitle(event.target.value)
  clearError("projectTitle")
}}
```

**개선 효과:**
- ✅ 폼 에러 로직 중앙화
- ✅ TypeScript 타입 안전성
- ✅ 다른 폼에서 재사용 가능

---

## 2. 유틸 함수 추출

### 2-1. 계산 로직 - calculatePercentage

#### ❌ Before (SimulationSetupPage.tsx, 반복된 계산)
```typescript
const ageDonutData = useMemo(
  () =>
    AGE_GROUP_CONFIG.map((ageGroup) => ({
      name: ageGroup.label,
      value: personaCount > 0 
        ? Number(((ageGroupCounts[ageGroup.key] / personaCount) * 100).toFixed(1)) 
        : 0,
      color: ageGroup.color,
      count: ageGroupCounts[ageGroup.key],
    })),
  [ageGroupCounts, personaCount]
)
```

#### ✅ After

**파일: `src/utils/number.ts`**
```typescript
/**
 * 백분율 계산
 * @param value - 부분값
 * @param total - 전체값
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @returns 백분율 (0~100)
 * @example
 * calculatePercentage(30, 100) // → 30
 * calculatePercentage(1, 3)    // → 33.3
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals: number = 1
): number {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

/**
 * 수를 한국어 로케일로 포맷
 * @example
 * formatNumber(1000) // → "1,000"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR")
}

/**
 * 초를 분/초 형식으로 포맷
 * @example
 * formatDuration(65)   // → "1분 5초"
 * formatDuration(45)   // → "45초"
 * formatDuration(120)  // → "2분"
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) return `${remainingSeconds}초`
  if (remainingSeconds === 0) return `${minutes}분`
  return `${minutes}분 ${remainingSeconds}초`
}
```

**사용: `src/pages/SimulationSetupPage.tsx`**
```typescript
import { calculatePercentage, formatNumber, formatDuration } from "@/utils/number"

// Before: 복잡한 인라인 계산
value: personaCount > 0 
  ? Number(((ageGroupCounts[ageGroup.key] / personaCount) * 100).toFixed(1)) 
  : 0

// After: 명확한 함수 호출
value: calculatePercentage(ageGroupCounts[ageGroup.key], personaCount)

// 다른 곳에서도 재사용
const label = `${formatNumber(totalAgents)}명`
const duration = formatDuration(avgCompletionSeconds)
```

**개선 효과:**
- ✅ 계산 로직 재사용성
- ✅ 단위/형식 일관성
- ✅ 테스트 가능성

---

### 2-2. URL 검증 - 공백 처리 추가

#### ❌ Before (validation/simulation-setup.ts)
```typescript
function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}
```

#### ✅ After

**파일: `src/utils/validation.ts`**
```typescript
/**
 * HTTP/HTTPS URL 검증
 * @param value - 검증할 URL
 * @returns 유효한 HTTP(S) URL인지 여부
 */
export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    return ["http:", "https:"].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * 페르소나 수 유효성 검증
 * @param counts - 연령대별 페르소나 수
 * @returns 유효한 페르소나 분배인지 여부
 */
export function isValidPersonaDistribution(
  counts: Record<string, number>
): boolean {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    total > 0 &&
    Object.values(counts).every(
      (count) => Number.isInteger(count) && count >= 0 && Number.isFinite(count)
    )
  )
}

/**
 * 범위 내 정수 검증
 * @param value - 검증할 값
 * @param min - 최소값
 * @param max - 최대값
 * @returns 범위 내 정수인지 여부
 */
export function isValidRange(
  value: number,
  min: number,
  max: number
): boolean {
  return (
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  )
}

/**
 * 시력 저하 값 검증 (0~100)
 */
export function isValidVisionImpairment(value: number): boolean {
  return isValidRange(value, 0, 100)
}

/**
 * 주의력 값 검증 (0~100)
 */
export function isValidAttentionLevel(value: number): boolean {
  return isValidRange(value, 0, 100)
}
```

**사용: `src/validation/simulation-setup.ts`**
```typescript
import {
  isValidHttpUrl,
  isValidPersonaDistribution,
  isValidVisionImpairment,
  isValidAttentionLevel,
} from "@/utils/validation"

export function validateSimulationSetupForm(form: SimulationFormViewModel) {
  const errors: SimulationSetupValidationErrors = {}

  if (!form.targetUrl.trim()) {
    errors.targetUrl = "시작 URL을 입력해주세요."
  } else if (!isValidHttpUrl(form.targetUrl)) {
    errors.targetUrl = "올바른 URL 형식으로 입력해주세요."
  }

  if (!isValidPersonaDistribution(form.ageCounts)) {
    errors.ageCounts = "최소 1명 이상의 페르소나를 설정해주세요."
  }

  if (!isValidVisionImpairment(form.visionImpairment)) {
    errors.visionImpairment = "시력 저하 값은 0~100 사이여야 합니다."
  }

  if (!isValidAttentionLevel(form.attentionLevel)) {
    errors.attentionLevel = "주의력 값은 0~100 사이여야 합니다."
  }

  return errors
}
```

**개선 효과:**
- ✅ 검증 로직 재사용 가능
- ✅ 단위별 명확한 함수
- ✅ 테스트 용이

---

## 3. 에러 처리 패턴

### 3-1. ErrorHandler 클래스

#### ❌ Before (SimulationSetupPage.tsx)
```typescript
try {
  const response = await createSimulationMutation.mutateAsync(requestBody)
  // ...
} catch (error) {
  if (error instanceof ApiServiceError) {
    setSubmitError(error.message)
    return
  }
  setSubmitError("시뮬레이션 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
}
```

#### ✅ After

**파일: `src/utils/error-handler.ts`**
```typescript
import { ApiServiceError } from "@/services"

interface ErrorContext {
  context: string
  userId?: string
  simulationId?: string
  [key: string]: unknown
}

export class ErrorHandler {
  /**
   * 에러 메시지 추출
   * @param error - 에러 객체
   * @param defaultMessage - 기본 메시지 (선택사항)
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
      // 개발 환경에서만 상세 메시지
      if (import.meta.env.DEV) {
        console.error("Error details:", error.message)
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
   * @param error - 에러 객체
   * @param context - 에러 컨텍스트 정보
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
      console.error("[ERROR]", logEntry)
    }

    // TODO: 프로덕션 환경에서 에러 트래킹 서비스로 전송
    // if (import.meta.env.PROD) {
    //   errorTracking.captureException(error, { tags: context })
    // }
  }

  /**
   * 에러 처리 (메시지 추출 + 로깅)
   */
  static handle(error: unknown, context: ErrorContext): string {
    this.logError(error, context)
    return this.getErrorMessage(error)
  }
}
```

**사용: `src/pages/SimulationSetupPage.tsx`**
```typescript
import { ErrorHandler } from "@/utils/error-handler"

try {
  const response = await createSimulationMutation.mutateAsync(requestBody)
  navigate(routes.simulationProcess, { state: { ... } })
} catch (error) {
  const message = ErrorHandler.handle(error, {
    context: "SimulationSetup.createSimulation",
    userId: auth.user?.id,
    endpoint: "POST /api/simulations",
  })
  setSubmitError(message)
}

// 다른 곳에서도 재사용
async function fetchResults() {
  try {
    return await resultService.getOverview(simulationId)
  } catch (error) {
    const message = ErrorHandler.handle(error, {
      context: "ResultPage.fetchOverview",
      simulationId,
    })
    setErrors(message)
  }
}
```

**개선 효과:**
- ✅ 일관된 에러 처리
- ✅ 자동 로깅
- ✅ 환경별 로깅 전략 분리

---

## 4. 레이아웃 상수 추출

### 4-1. 레이아웃 설정 상수화

#### ❌ Before (SimulationSetupPage.tsx)
```typescript
className={cn(
  "grid w-full max-w-[1480px] items-start gap-8 pb-8 pt-2 xl:grid-cols-[minmax(0,740px)_420px]",
  motion.page
)}
```

#### ✅ After

**파일: `src/constants/layout.ts`**
```typescript
/**
 * 프로젝트 전체 레이아웃 설정
 * - 일관된 간격
 - 반응형 브레이크포인트
 * - 최대 너비 정의
 */

export const LAYOUT_SPACING = {
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-8",
  xl: "gap-12",
} as const

export const LAYOUT_PADDING = {
  pageTop: "pt-2",
  pageBottom: "pb-8",
  sectionTop: "pt-4",
  sectionBottom: "pb-4",
  cardPadding: "p-6",
} as const

export const LAYOUT_MAX_WIDTH = {
  full: "max-w-full",
  container: "max-w-[1480px]",
  content: "max-w-[740px]",
  narrow: "max-w-[600px]",
  sidePanel: "max-w-[420px]",
} as const

export const LAYOUT_GRID = {
  twoColumnSetup: "xl:grid-cols-[minmax(0,740px)_420px]",
  twoColumnEqual: "grid-cols-1 md:grid-cols-2",
  threeColumnEqual: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  responsive: "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3",
} as const

export const LAYOUT_CONFIG = {
  setupPage: {
    wrapper: `grid w-full items-start ${LAYOUT_SPACING.lg} ${LAYOUT_PADDING.pageBottom} ${LAYOUT_PADDING.pageTop} ${LAYOUT_MAX_WIDTH.container} ${LAYOUT_GRID.twoColumnSetup}`,
    contentColumn: `grid w-full ${LAYOUT_MAX_WIDTH.content} ${LAYOUT_SPACING.md}`,
    sidePanel: `grid w-full ${LAYOUT_MAX_WIDTH.sidePanel}`,
  },
  resultPage: {
    wrapper: `grid w-full items-start ${LAYOUT_SPACING.lg} ${LAYOUT_MAX_WIDTH.container}`,
    tabContent: `grid w-full ${LAYOUT_SPACING.md}`,
  },
} as const

/**
 * Tailwind CSS 커스텀 스크린 정의
 * tailwind.config.ts에서 참고
 * 
 * screens: {
 *   tablet: "900px",
 *   desktop: "1280px",
 * }
 */
```

**사용: `src/pages/SimulationSetupPage.tsx`**
```typescript
import { LAYOUT_CONFIG, LAYOUT_SPACING, motion } from "@/constants"
import { cn } from "@/lib/utils"

export function SimulationSetupPage() {
  return (
    <section className={cn(LAYOUT_CONFIG.setupPage.wrapper, motion.page)}>
      <div className={LAYOUT_CONFIG.setupPage.contentColumn}>
        {/* 콘텐츠 */}
      </div>
      <aside className={LAYOUT_CONFIG.setupPage.sidePanel}>
        {/* 사이드 패널 */}
      </aside>
    </section>
  )
}
```

**개선 효과:**
- ✅ 매직 넘버 제거
- ✅ 프로젝트 전체 일관성
- ✅ 반응형 변경 시 한 곳에서 수정

---

## 5. 조건부 렌더링 헬퍼

### 5-1. Show 컴포넌트

#### ❌ Before (SimulationSetupPage.tsx)
```typescript
{submitError ? (
  <ErrorState
    title="시뮬레이션을 시작하지 못했습니다"
    description={submitError}
    actionLabel="다시 시도"
    onAction={() => setSubmitError(null)}
  />
) : null}

{isPending ? <Spinner /> : null}
```

#### ✅ After

**파일: `src/components/utils/show.tsx`**
```typescript
import type { PropsWithChildren } from "react"

interface ShowProps extends PropsWithChildren {
  when: boolean
}

/**
 * 조건부 렌더링 헬퍼 컴포넌트
 * @example
 * <Show when={isLoading}>
 *   <Spinner />
 * </Show>
 */
export function Show({ when, children }: ShowProps) {
  return when ? children : null
}

/**
 * ElseIf 지원하는 버전
 */
interface SwitchProps extends PropsWithChildren {
  condition: unknown
}

export function Switch({ condition, children }: SwitchProps) {
  return condition ? children : null
}

/**
 * Fragment 반환 필요 시
 */
export function ShowFragment({ when, children }: ShowProps) {
  return when ? <>{children}</> : null
}
```

**사용: `src/pages/SimulationSetupPage.tsx`**
```typescript
import { Show } from "@/components/utils"

export function SimulationSetupPage() {
  return (
    <>
      <Show when={!!submitError}>
        <ErrorState
          title="시뮬레이션을 시작하지 못했습니다"
          description={submitError}
          actionLabel="다시 시도"
          onAction={() => setSubmitError(null)}
        />
      </Show>

      <Show when={isPending}>
        <Spinner />
      </Show>
    </>
  )
}
```

**개선 효과:**
- ✅ 가독성 향상
- ✅ 삼항연산자 중첩 회피
- ✅ 선언적 코드 스타일

---

## 6. Service Factory 개선

### 6-1. 제네릭 Service Proxy

#### ❌ Before (services/core/service-factory.ts)
```typescript
export const simulationService = SERVICE_CONFIG.useMockServices 
  ? simulationMockService 
  : simulationHttpService
export const resultOverviewService = SERVICE_CONFIG.useMockServices 
  ? resultOverviewMockService 
  : resultOverviewHttpService
export const resultIssuesService = SERVICE_CONFIG.useMockServices 
  ? resultIssuesMockService 
  : resultIssuesHttpService
// ... 반복 (6번)
```

#### ✅ After

**파일: `src/services/core/service-factory.ts`**
```typescript
import { SERVICE_CONFIG } from "@/services/core/service-config"

interface ServicePair<T> {
  mock: T
  http: T
}

interface ServiceRegistry {
  simulation: ServicePair<SimulationService>
  resultOverview: ServicePair<ResultOverviewService>
  resultIssues: ServicePair<ResultIssuesService>
  resultAiFix: ServicePair<ResultAiFixService>
  resultHeatmap: ServicePair<ResultHeatmapService>
  resultWcag: ServicePair<ResultWcagService>
}

/**
 * Mock/HTTP 서비스 선택 로직
 */
function selectService<T>(pair: ServicePair<T>): T {
  return SERVICE_CONFIG.useMockServices ? pair.mock : pair.http
}

/**
 * 서비스 레지스트리
 */
const serviceRegistry: ServiceRegistry = {
  simulation: {
    mock: simulationMockService,
    http: simulationHttpService,
  },
  resultOverview: {
    mock: resultOverviewMockService,
    http: resultOverviewHttpService,
  },
  resultIssues: {
    mock: resultIssuesMockService,
    http: resultIssuesHttpService,
  },
  resultAiFix: {
    mock: resultAiFixMockService,
    http: resultAiFixHttpService,
  },
  resultHeatmap: {
    mock: resultHeatmapMockService,
    http: resultHeatmapHttpService,
  },
  resultWcag: {
    mock: resultWcagMockService,
    http: resultWcagHttpService,
  },
}

/**
 * 서비스 exports
 */
export const simulationService = selectService(serviceRegistry.simulation)
export const resultOverviewService = selectService(serviceRegistry.resultOverview)
export const resultIssuesService = selectService(serviceRegistry.resultIssues)
export const resultAiFixService = selectService(serviceRegistry.resultAiFix)
export const resultHeatmapService = selectService(serviceRegistry.resultHeatmap)
export const resultWcagService = selectService(serviceRegistry.resultWcag)

/**
 * 새로운 서비스 추가 시:
 * 1. serviceRegistry에 추가
 * 2. 아래 export 추가
 * 
 * export const newService = selectService(serviceRegistry.new)
 */
```

**개선 효과:**
- ✅ 조건 분기 반복 제거
- ✅ 새 서비스 추가 시 일관성 유지
- ✅ 타입 안전성 (ServiceRegistry)

---

이 예제들을 통해 코드 리뷰 보고서의 개선 사항을 실제로 구현할 수 있습니다! 🚀

