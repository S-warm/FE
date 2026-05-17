/**
 * 🚨 UX-Swarm FE Critical Fixes
 *
 * 3가지 Critical 수정사항을 위한 완전한 코드
 *
 * 적용 순서:
 * 1. Fix #1: HTTP timeout 설정
 * 2. Fix #2: 401 에러 처리 (토큰 만료)
 * 3. Fix #3: severity 대소문자 정규화
 *
 * 수정 후: npm run build && npm run dev
 */

// ============================================================================
// 🚨 Fix #1: HTTP Timeout 설정 (30초)
// ============================================================================
// 파일: src/services/core/http-client.ts
// 위치: requestJson() 함수 전체 수정
// 영향: 모든 API 요청에 30초 제한 적용

export async function requestJsonWithTimeout<T>(
  path: string,
  options: RequestOptions = {}
) {
  const headers = withContentType(buildHeaders(options.headers), options.body)

  // timeout 설정
  const controller = new AbortController()
  const REQUEST_TIMEOUT_MS = 30000 // 30초

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: serializeBody(options.body),
      signal: controller.signal, // ← timeout 신호 주입
    })

    const payload = await parseResponseBody(response)

    if (!response.ok) {
      throw new ApiServiceError(toApiErrorPayload(path, response, payload))
    }

    return unwrapPayload<T>(payload)
  } catch (error) {
    // timeout 에러 처리
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiServiceError({
        status: 408,
        error: "Request Timeout",
        message: `요청이 ${REQUEST_TIMEOUT_MS / 1000}초 이상 걸렸습니다. 네트워크 연결을 확인하세요.`,
        path,
      })
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// 기존 requestJson() 함수를 이 함수로 교체하고,
// export const requestJson = requestJsonWithTimeout 으로 이름만 변경

// ============================================================================
// 🚨 Fix #2: 401 에러 처리 (토큰 만료 시 로그인 페이지 리다이렉트)
// ============================================================================
// 파일: src/services/core/http-client.ts
// 위치: requestJson 함수 내 fetch 직후, response 처리 부분
// 영향: 토큰 만료 시 자동으로 로그인 페이지로 이동

async function handleUnauthorized(path: string, response: Response) {
  // 401 에러는 토큰 만료를 의미
  const authStore = useAuthStore.getState()

  // 1. 로컬 저장소에서 토큰 제거
  authStore.logout()

  // 2. React Query 캐시 클리어 (필요 시)
  // import { useQueryClient } from "@tanstack/react-query"
  // const queryClient = useQueryClient()
  // queryClient.clear()

  // 3. 로그인 페이지로 리다이렉트
  window.location.href = "/login?reason=token-expired&returnUrl=" + encodeURIComponent(window.location.pathname)

  // 이 함수를 호출한 후 더 이상 진행하지 않도록 throw
  throw new ApiServiceError({
    status: 401,
    error: "Unauthorized",
    message: "세션이 만료되었습니다. 다시 로그인해주세요.",
    path,
  })
}

// ─────────────────────────────────────────────────────────────────────────
// requestJson() 함수의 응답 처리 부분에 추가:
// ─────────────────────────────────────────────────────────────────────────

export async function requestJsonFixed<T>(
  path: string,
  options: RequestOptions = {}
) {
  const headers = withContentType(buildHeaders(options.headers), options.body)

  const controller = new AbortController()
  const REQUEST_TIMEOUT_MS = 30000
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: serializeBody(options.body),
      signal: controller.signal,
    })

    // 🚨 401 체크 (responseBody 파싱 전에 먼저 확인)
    if (response.status === 401) {
      await handleUnauthorized(path, response)
      // 위 함수가 throw하므로 여기 도달 X
    }

    const payload = await parseResponseBody(response)

    if (!response.ok) {
      throw new ApiServiceError(toApiErrorPayload(path, response, payload))
    }

    return unwrapPayload<T>(payload)
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiServiceError({
        status: 408,
        error: "Request Timeout",
        message: "요청이 30초 이상 걸렸습니다. 네트워크 연결을 확인하세요.",
        path,
      })
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// ============================================================================
// 🚨 Fix #3: severity 정규화 통일
// ============================================================================
// 파일: 신규 생성 src/adapters/result/result-severity.adapter.ts
// 영향: Issues, Heatmap, WCAG의 severity를 모두 대문자로 통일

/**
 * Severity 정규화 어댑터
 *
 * Issues 명세: "high", "medium", "low" (소문자)
 * Heatmap 명세: "HIGH", "MEDIUM", "LOW" (대문자)
 * WCAG 명세: "Critical", "Moderate", "Minor" (PascalCase)
 *
 * → 모두 NormalizedSeverity("HIGH", "MEDIUM", "LOW", "CRITICAL")로 통일
 */

export type NormalizedSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

/**
 * Issues/Heatmap용 정규화
 * 입력: "high", "HIGH", "critical", "CRITICAL" 등 모든 형식
 * 출력: "HIGH", "MEDIUM", "LOW", "CRITICAL"
 */
export function adaptIssueSeverity(severity: unknown): NormalizedSeverity {
  const normalized = String(severity).trim().toUpperCase()

  if (normalized === "CRITICAL") {
    return "CRITICAL"
  }
  if (normalized === "HIGH") {
    return "HIGH"
  }
  if (normalized === "MEDIUM") {
    return "MEDIUM"
  }

  return "LOW"
}

/**
 * WCAG용 정규화
 * 입력: "Critical", "Moderate", "Minor"
 * 출력: "CRITICAL", "HIGH", "LOW"
 */
export function adaptWcagSeverity(
  severity: unknown
): "CRITICAL" | "HIGH" | "LOW" {
  const normalized = String(severity).trim().toLowerCase()

  if (normalized === "critical") {
    return "CRITICAL"
  }
  if (normalized === "moderate") {
    return "HIGH" // WCAG Moderate = High 우선순위
  }

  return "LOW" // Minor
}

/**
 * 컴포넌트에서 사용할 표시용 레이블
 */
export function getSeverityLabel(
  severity: NormalizedSeverity
): { label: string; color: string } {
  switch (severity) {
    case "CRITICAL":
      return { label: "극심", color: "#E63946" } // 빨강
    case "HIGH":
      return { label: "높음", color: "#F77F00" } // 주황
    case "MEDIUM":
      return { label: "중간", color: "#FCBF49" } // 노랑
    case "LOW":
      return { label: "낮음", color: "#06D6A0" } // 초록
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 기존 어댑터에서 사용 방법:
// ─────────────────────────────────────────────────────────────────────────

// result-issues.adapter.ts에서:
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"

function mapBusinessIssueToViewModel(issue: SimulationBusinessIssueDto) {
  return {
    // ... 기존 필드
    severity: adaptIssueSeverity(issue.severity), // ← 이렇게 사용
  }
}

// result-heatmap.adapter.ts에서:
function toBusinessViewModel(...) {
  return {
    pages: [...].map((page) => ({
      points: page.errorPoints.map((point) => ({
        severity: adaptIssueSeverity(point.severity), // ← 이렇게 사용
      })),
    })),
  }
}

// result-wcag.adapter.ts에서:
import { adaptWcagSeverity } from "@/adapters/result/result-severity.adapter"

function toBusinessPages(...) {
  return {
    pages: [...].map((page) => ({
      distribution: buildDistributionItems({
        critical: page.result.distribution.Critical,
        moderate: page.result.distribution.Moderate,
        minor: page.result.distribution.Minor,
      }),
      issues: page.result.violations.map((violation) => ({
        severity: adaptWcagSeverity(violation.severity), // ← 이렇게 사용
      })),
    })),
  }
}

// ============================================================================
// 추가: .env.production 파일 생성
// ============================================================================
// 파일: .env.production
// 위치: 프로젝트 루트

/**
 * # EC2 배포용 환경변수
 * # .env.production
 *
 * # EC2의 실제 주소로 교체 필요
 * VITE_API_BASE_URL=https://52.XX.XX.XX:8080
 * # 또는 도메인 사용 시
 * VITE_API_BASE_URL=https://api.uxswarm.example.com
 *
 * # 프로덕션에서는 Mock 비활성화
 * VITE_USE_MOCK_SERVICES=false
 *
 * # Preview 데이터도 모두 비활성화
 * VITE_USE_OVERVIEW_PREVIEW_DATA=false
 * VITE_USE_ISSUES_PREVIEW_DATA=false
 * VITE_USE_HEATMAP_PREVIEW_DATA=false
 * VITE_USE_WCAG_PREVIEW_DATA=false
 * VITE_USE_AI_FIX_PREVIEW_DATA=false
 *
 * # 프로덕션 사용자 ID (세팅 필요)
 * VITE_DEFAULT_USER_ID=prod-user-id
 */

// ============================================================================
// 추가: .gitignore 수정
// ============================================================================
// 파일: .gitignore
// 추가 항목:

/**
 * # Local environment variables (절대 커밋 X)
 * .env.local
 * .env.*.local
 * .env.development.local
 * .env.test.local
 *
 * # Sensitive files
 * *.pem
 * *.key
 */

// ============================================================================
// 적용 체크리스트
// ============================================================================

/**
 * ✅ Fix #1 적용 확인
 * - [ ] src/services/core/http-client.ts 수정
 * - [ ] requestJson 함수에 controller 추가
 * - [ ] DOMException "AbortError" 처리 추가
 * - [ ] npm run build 성공
 * - [ ] dev 서버 시작 후 네트워크 요청이 30초 후 timeout 확인
 *
 * ✅ Fix #2 적용 확인
 * - [ ] src/services/core/http-client.ts 수정
 * - [ ] response.status === 401 체크 추가
 * - [ ] handleUnauthorized() 함수 호출
 * - [ ] login 페이지로 리다이렉트 동작 확인
 * - [ ] localStorage에서 swarm-auth 제거되는지 확인
 *
 * ✅ Fix #3 적용 확인
 * - [ ] src/adapters/result/result-severity.adapter.ts 생성
 * - [ ] adaptIssueSeverity() 함수 구현
 * - [ ] adaptWcagSeverity() 함수 구현
 * - [ ] result-issues.adapter.ts에서 adaptIssueSeverity 호출로 변경
 * - [ ] result-heatmap.adapter.ts에서 adaptIssueSeverity 호출로 변경
 * - [ ] result-wcag.adapter.ts에서 adaptWcagSeverity 호출로 변경
 * - [ ] npm run build 성공
 * - [ ] Overview, Issues, Heatmap, WCAG 페이지에서 severity 색상 일관됨 확인
 *
 * ✅ 환경 설정 확인
 * - [ ] .env.production 파일 생성
 * - [ ] .gitignore에 .env.local 추가
 * - [ ] .env.local은 git 캐시에서 제거: git rm --cached .env.local
 */

// ============================================================================
// 예상 수정 소요 시간
// ============================================================================

/**
 * Fix #1 (timeout): 15분
 *   - 코드 이해: 2분
 *   - 작성: 5분
 *   - 테스트: 8분
 *
 * Fix #2 (401 처리): 20분
 *   - 코드 이해: 3분
 *   - 작성: 8분
 *   - 테스트 (401 강제 생성): 9분
 *
 * Fix #3 (severity 정규화): 25분
 *   - 파일 생성: 10분
 *   - 어댑터 수정: 10분
 *   - 테스트: 5분
 *
 * 환경 설정: 5분
 *   - .env.production 작성: 2분
 *   - .gitignore 수정: 1분
 *   - git cleanup: 2분
 *
 * 총합: 65분 (1시간 5분)
 */
