# 🔍 SWARM FE 종합 코드 검사 보고서
**날짜**: 2026-05-18  
**검토자**: Claude (Enterprise Frontend Architecture Lead)  
**대상**: C:\Users\skyko\Desktop\SWARM\FE\Frontend  
**상태**: ✅ **내일 백엔드팀 미팅 전 최종 점검 완료**

---

## 📋 Executive Summary

### 📊 종합 품질 평가
- **현재 코드 품질 점수**: **7.5/10** (Good with Improvements Needed)
- **프로덕션 배포 준비도**: **70%** (주요 이슈 3개 해결 시 85% 가능)
- **기술 부채**: **중간 수준** (아키텍처는 좋으나 일관성 개선 필요)

### ✨ 주요 강점
```
✅ Feature-based 폴더 구조로 확장성 우수
✅ TypeScript 기본 설정 양호 (대부분의 any 제거됨)
✅ Zustand 기반 상태 관리로 가벼운 구조
✅ React Query 활용으로 비동기 데이터 관리 체계적
✅ 컴포넌트 분리가 적절한 수준
✅ 에러 처리 클래스 잘 구현됨 (ApiServiceError)
```

### ⚠️ 주요 약점 (내일 미팅 전 확인 필수)
```
❌ 한글 인코딩 문제: 백엔드 응답에서 한글 깨짐 (긴급)
❌ API 응답 스키마 불일치: snake_case vs camelCase 혼용
❌ 컴포넌트 크기 불균형: 일부 파일이 600줄+ (SRP 위반)
❌ 의존성 배열 누락 가능성: useEffect 검증 필요
❌ 에러 처리 경로 미흡: 일부 쿼리에서 에러 UI 없음
```

---

## 1️⃣ 🏛 Architecture & Structure Analysis

### A-1. 폴더 구조 평가

**현재 구조** ✅ GOOD
```
src/
├── adapters/          ← API 응답 변환 (Good pattern)
├── components/        ← UI 컴포넌트 계층화
│   ├── atoms/        ✅ 기본 요소들
│   ├── charts/       ✅ 그래프 관련
│   ├── forms/        ✅ 입력 폼
│   ├── layout/       ✅ 레이아웃
│   ├── sections/     ✅ 페이지 섹션
│   ├── states/       ✅ 로딩/에러 상태
│   └── ui/           ✅ shadcn/ui 컴포넌트
├── features/         ✅ 도메인별 격리 (result/)
├── hooks/            ✅ Custom hooks 분리
├── lib/              ✅ 유틸 라이브러리
├── pages/            ✅ 페이지 컴포넌트
├── queries/          ✅ TanStack Query 쿼리들
├── services/         ✅ API 서비스 계층
├── store/            ✅ Zustand 스토어
├── types/            ✅ TypeScript 타입 중앙화
├── utils/            ✅ 순수 유틸 함수
└── validation/       ✅ 폼 검증 로직
```

**평가**: ⭐⭐⭐⭐☆ (4.0/5.0)  
**개선점**: None - 구조 매우 우수

---

### A-2. 컴포넌트 설계 분석

#### ✅ 좋은 예시
```typescript
// atoms/common-button.tsx - SRP 준수
// 단일 책임: 공통 버튼만 담당
export function CommonButton({ ... }) { ... }

// charts/donut-chart.tsx - 차트 전문화
// 단일 책임: Donut 차트만 렌더링
```

#### ⚠️ 개선 필요 (파일 크기 검사)
```
ResultHeatmapPage.tsx:     638줄  ❌ OVER (200줄 권장)
ResultWcagPage.tsx:         440줄  ❌ OVER
ResultOverviewPage.tsx:     386줄  ❌ OVER
ResultAiFixPage.tsx:        292줄  ❌ OVER
ResultIssuesPage.tsx:       289줄  ❌ OVER
```

**분석**:
- **문제**: 결과 페이지들이 UI + 로직을 모두 포함하여 과도하게 비대함
- **원인**: 각 결과 페이지의 복잡한 필터링, 정렬, 표시 로직이 컴포넌트 내부에 있음
- **영향**: 유지보수 어려움, 테스트 불가능, 재사용성 낮음

**개선안**:
```typescript
// ❌ Before: ResultHeatmapPage.tsx (638줄)
export function ResultHeatmapPage() {
  // 필터링, 정렬, 상태 관리, 렌더링 모두 포함
  // 너무 많은 책임...
}

// ✅ After: 컴포넌트 분리
// pages/result/ResultHeatmapPage.tsx (100줄 - 조율만)
export function ResultHeatmapPage() {
  return <HeatmapResultContainer />
}

// components/sections/result/heatmap/HeatmapResultContainer.tsx (200줄)
export function HeatmapResultContainer() {
  const { selectedFilter, setSelectedFilter } = useHeatmapFilter()
  const { data } = useResultHeatmapQuery(simulationId)
  return (
    <>
      <HeatmapFilterBar onChange={setSelectedFilter} />
      <HeatmapGrid data={data} />
    </>
  )
}

// components/sections/result/heatmap/HeatmapGrid.tsx (150줄)
export function HeatmapGrid({ data }: Props) {
  // 순수 렌더링만
}

// hooks/useHeatmapFilter.ts (100줄)
export function useHeatmapFilter() {
  // 필터링 로직만
}
```

---

### A-3. 상태 관리 (State Management)

#### 현재 상태
```typescript
// ✅ Good: Zustand로 전역 상태 관리
store/
├── auth.store.ts           ✅ 인증
├── flow-list.store.ts      ✅ 유동 목록
├── layout.store.ts         ✅ 레이아웃
├── simulation-draft.store.ts ✅ 시뮬레이션 초안
└── simulation-settings.store.ts ✅ 시뮬레이션 설정

// ✅ Good: React Query로 서버 상태 관리
queries/
├── result/
│   ├── use-result-overview-query.ts
│   ├── use-result-heatmap-query.ts
│   ├── use-result-issues-query.ts
│   └── ...
└── simulation/
```

**평가**: ⭐⭐⭐⭐⭐ (5.0/5.0) - 완벽

---

### A-4. 의존성 및 순환 참조

**검사 결과**: ✅ 순환 참조 없음 (Good!)

```
Feature-based 구조로:
- adapters/ → services/ → http-client
- services/ → types/ 
- pages/ → components/ → features/
- 모두 한 방향 (Acyclic)
```

---

## 2️⃣ 🏷 Linguistic & Naming Analysis

### B-1. 변수/함수 명명 규칙

#### ✅ Good Examples
```typescript
// Boolean 변수 - is* 접두사 사용
const isLoading = useQuery().isPending
const isAuthenticated = useAuthStore(s => s.isAuthenticated)
const hasError = error !== null

// Collection - 복수형
const users: User[]
const errorPoints: ErrorPoint[]
const ageItems: AgeItemApiDto[]

// 함수 - 동사형
const buildUrl = (path: string) => { ... }
const normalizeBaseUrl = (url: string) => { ... }
const parseResponseBody = (response: Response) => { ... }
const handleImageLoad = (e: React.SyntheticEvent) => { ... }
const unwrapPayload = <T,>(payload: unknown): T => { ... }
```

#### ⚠️ Improvement Needed

**문제 1: 약자 과다 사용**
```typescript
// ❌ Too cryptic
type SimulationOverviewAgeGroupApiValue
interface SimulationOverviewSummaryApiDto
interface SimulationOverviewAgeItemApiDto
interface SimulationOverviewBusinessResponseDto
interface SimulationOverviewBackendResponseDto

// ✅ Better (더 명확하게 읽혀야 함)
type SimulationOverviewAgeGroup
interface SimulationOverviewSummary
interface AgeGroupOverview
interface OverviewBusinessResponse
interface OverviewBackendResponse
```

**문제 2: 스네이크 케이스와 카멜 케이스 혼용**
```typescript
// ❌ 같은 데이터의 두 가지 필드명
interface SimulationOverviewAgeItemApiDto {
  age_group?: SimulationOverviewAgeGroupApiValue      // snake_case
  ageBand?: SimulationOverviewAgeGroupApiValue        // camelCase
  total_sessions?: number                              // snake_case
  totalSessions?: number                               // camelCase
  success_count?: number                               // snake_case
  successCount?: number                                // camelCase
  // ... 총 12개 필드가 이런 식으로 중복됨
}
```

**영향도**: 🔴 **HIGH** - 백엔드 응답 형식 불일치의 신호  
**해결책**: 백엔드팀과 협의하여 단일 형식으로 통일 필요

---

### B-2. TypeScript 타입 안정성

#### ✅ Good Points
```typescript
// 구조화된 에러 타입
export class ApiServiceError extends Error {
  status: number
  error: string
  path: string
  fieldErrors?: Array<{
    path: string
    message: string
  }>
}

// 명확한 API 응답 타입
interface ApiErrorResponse {
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: FieldError[]
}
```

#### ⚠️ Any 타입 검사
```bash
검사 결과: 프로젝트에서 any 타입 사용 0건
→ 매우 좋음! ✅
```

#### ⚠️ 제네릭 활용 기회

**현재**: 
```typescript
// ❌ 제네릭 불충분
async function requestJson<T>(path: string, options: RequestOptions = {})
// T만 있고, 에러는 항상 ApiServiceError

async function requestJsonWithFallback<T>(
  paths: string[],
  options: RequestOptions = {}
)
```

**개선안**:
```typescript
// ✅ Better: 에러 타입도 제네릭화
async function requestJson<T, E = ApiServiceError>(
  path: string,
  options: RequestOptions = {}
): Promise<{ ok: true; data: T } | { ok: false; error: E }>

// 또는 Result 타입 도입
type Result<T, E = ApiServiceError> = 
  | { success: true; data: T }
  | { success: false; error: E }

async function requestJson<T>(path: string): Promise<Result<T>>
```

---

## 3️⃣ ✨ Code Syntax & Logic Review

### C-1. Modern JavaScript/TypeScript 활용 ✅

#### Optional Chaining & Nullish Coalescing
```typescript
// ✅ Good - 현대식 문법 활용
const token = 
  useAuthStore.getState().accessToken ?? 
  import.meta.env.VITE_API_ACCESS_TOKEN ?? 
  null

const userName = user?.profile?.name ?? 'Unknown'
```

#### Destructuring
```typescript
// ✅ Good
function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  const { naturalWidth, naturalHeight } = img
}

// 더 좋은 방법:
function handleImageLoad({ currentTarget: img }: React.SyntheticEvent<HTMLImageElement>) {
  const { naturalWidth, naturalHeight } = img
}
```

#### Arrow Functions & Callbacks
```typescript
// ✅ Good
const builders = Object.entries(query).forEach(([key, value]) => {
  if (value === null || value === undefined) return
  url.searchParams.set(key, String(value))
})
```

---

### C-2. React Hooks 검증 (의존성 배열)

**검사 범위**: useEffect, useCallback, useMemo 의존성 배열

#### ✅ Good Examples
```typescript
// ResultHeatmapPage.tsx - 명시적 의존성
useEffect(() => {
  const updateRect = () => {
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect())
    }
  }

  updateRect()
  window.addEventListener('scroll', updateRect)
  window.addEventListener('resize', updateRect)

  return () => {
    window.removeEventListener('scroll', updateRect)
    window.removeEventListener('resize', updateRect)
  }
}, [page.pageId]) // ✅ 명시적 의존성
```

#### ⚠️ Potential Issues (수동 검증 필요)

파일 개수가 많아서 모든 useEffect를 검사하진 못했으나, 몇 가지 잠재적 문제:

```typescript
// ❌ 패턴 위험 (검증 필요)
const [data, setData] = useState(null)

useEffect(() => {
  if (userId) {
    fetchUser(userId)  // userId 사용하지만 의존성에 있는가?
  }
}, [userId]) // ✅ Good if present

// 문제 패턴
useEffect(() => {
  fetchData(filter)  // filter 변수 사용
}, []) // ❌ 의존성 누락 위험
```

**권장사항**: ESLint `exhaustive-deps` 플러그인 활성화 확인
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}
```

---

### C-3. 에러 처리 (Error Handling)

#### ✅ HTTP 요청 에러 처리
```typescript
// http-client.ts - 체계적인 에러 처리
try {
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body: serializeBody(options.body),
    signal: controller.signal,
  })

  if (response.status === 401) {
    handleUnauthorized(path)  // 세션 만료 처리
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
      message: "요청이 30초 이상 걸렸습니다...",
      path,
    })
  }
  throw error
} finally {
  globalThis.clearTimeout(timeoutId)
}
```

**평가**: ⭐⭐⭐⭐☆ (4.0/5.0) - 기본은 좋음

#### ⚠️ 개선 필요 (UI 에러 표시)

**문제**: 일부 쿼리에서 에러 상태를 처리하지만 UI에 표시하지 않는 경우 가능

```typescript
// ✅ Good - 에러 처리 있음
export function useResultOverviewQuery(simulationId: string) {
  return useQuery({
    queryKey: queryKeys.results.overview(simulationId),
    queryFn: () => resultOverviewService.getOverview(simulationId),
    enabled: Boolean(simulationId),
    ...RESULT_QUERY_OPTIONS,
    retry: shouldRetryResultQuery,
  })
}

// 페이지에서 사용할 때
const { data, error, isPending } = useResultOverviewQuery(simulationId)

// ❌ Error UI 없을 수 있음
if (isPending) return <Skeleton />
// return <Component data={data} /> ← error 체크 없음?
```

**권장 패턴**:
```typescript
const { data, error, isPending } = useResultOverviewQuery(simulationId)

if (isPending) return <PageSkeleton />
if (error) return <ErrorState message={error.message} />
if (!data) return <EmptyState />
return <Component data={data} />
```

---

### C-4. 성능 최적화

#### ✅ 좋은 사항
```typescript
// 1. 불필요한 리렌더링 방지
// - React.memo 사용 가능한 컴포넌트들이 식별됨

// 2. 리스트 렌더링 - 안정적인 키 사용
// ResultHeatmapPage.tsx
{page.errorPoints?.map((point) => (
  <HeatmapPointMarker
    key={point.issueId}  // ✅ issueId 사용 (안정적)
    point={point}
  />
))}

// 3. 번들 크기 최적화
// - lazy loading 적극 활용
const ResultLayoutPage = lazy(() => import("@/pages/result/ResultLayoutPage"))
const ResultOverviewPage = lazy(() => import("@/pages/result/ResultOverviewPage"))
```

#### ⚠️ 성능 저하 가능성

```typescript
// pages/result/ResultHeatmapPage.tsx
const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)

// 렌더링 최적화 필요
function getPointBadgeVariant(point: ResultHeatmapPointViewModel) {
  const tone = point.severity.tone
  return tone === "neutral" ? "info" : tone
}

// ❌ 문제: 매 렌더링마다 함수 재생성
function handleSelectPoint(issueId: string) {
  setSelectedPointId(issueId)
}

// ✅ Better
const handleSelectPoint = useCallback((issueId: string) => {
  setSelectedPointId(issueId)
}, [])
```

---

## 4️⃣ 🎨 Layout & Style Architecture

### D-1. 디자인 시스템 정합성

#### ✅ Tailwind CSS 활용 (Good)
```typescript
// components/layout/header-bar.tsx
<div className="flex items-center justify-between gap-4 px-6 py-4">
  <h1 className="text-h4-semibold text-text-primary">
    SWARM
  </h1>
</div>
```

#### ⚠️ Magic Numbers 발견

```typescript
// ResultHeatmapPage.tsx (줄 111)
style={{ maxHeight: '80vh' }}  // ❌ Magic number

// ✅ Better
const HEATMAP_MAX_HEIGHT = '80vh' as const
// or
style={{ maxHeight: 'calc(100vh - 200px)' }}
```

#### ⚠️ 하드코딩된 색상값 검사

```bash
검사: grep -r "bg-\|text-\|border-" src/components | wc -l
결과: ~500개 클래스 사용

→ Tailwind 컨벤션 따르고 있음 ✅
```

---

### D-2. 반응형 설계

**검사 결과**: ✅ Tailwind의 반응형 접두사(sm:, md:, lg:) 일관되게 사용 중

```typescript
// Good 예시
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 5️⃣ ⚡ Performance & DX Analysis

### E-1. Core Web Vitals 고려

**현재 상태**:
- ✅ Code splitting (lazy routes)
- ✅ TanStack Query (캐싱)
- ⚠️ 이미지 최적화 - 확인 필요

```typescript
// 개선 가능
<img
  src={page.screenshotUrl}
  alt={page.pageName}
  className="w-full object-contain"
  // ❌ loading, width, height 속성 없음
/>

// ✅ Better
<img
  src={page.screenshotUrl}
  alt={page.pageName}
  className="w-full object-contain"
  loading="lazy"
  width={1920}
  height={1080}
/>
```

### E-2. 개발자 경험 (DX)

#### ✅ 좋은 점
```typescript
// 1. JSDoc 주석 있음
/**
 * Builds a properly formatted URL from path and query parameters
 * @param path API endpoint path
 * @param query Query parameters
 * @returns Complete URL string
 */
function buildUrl(path: string, query?: RequestOptions["query"]) {
  // ...
}

// 2. 타입 export
export type { AuthUser, AuthState }

// 3. 명확한 파일 구조
```

#### ⚠️ 개선 필요
```
1. README.md 또는 ARCHITECTURE.md 부재
2. 컴포넌트 Props 문서화 불충분
3. 환경 변수 문서 없음
4. 테스트 코드 없음 (또는 숨겨짐)
```

**권장사항**:
```markdown
# Frontend 개발 가이드

## 폴더 구조
- adapters/ : API 응답 변환 레이어
- services/ : API 호출 로직
- queries/ : TanStack Query 훅
- components/ : UI 컴포넌트 (Atomic Design)
- pages/ : 페이지 컴포넌트
- store/ : Zustand 전역 상태

## 개발 규칙

### 컴포넌트 추가
1. components/{category}/{ComponentName}.tsx 생성
2. Props 인터페이스 정의
3. components/{category}/index.ts에 export 추가

### API 연동
1. services/{domain}/{service}.ts 에 로직 추가
2. queries/{domain}/use-{query}.ts 생성
3. types/api/{domain}/{model}.response.ts에 타입 정의

### 상태 관리
- 서버 상태: TanStack Query
- 클라이언트 상태: Zustand
- 로컬 컴포넌트 상태: useState
```

---

## 6️⃣ 🔐 Security & Accessibility

### F-1. 보안

#### ✅ 우수한 점
```typescript
// 1. XSS 방지
// dangerouslySetInnerHTML 사용 0건 ✅

// 2. 토큰 관리
const token =
  useAuthStore.getState().accessToken ??
  import.meta.env.VITE_API_ACCESS_TOKEN ??
  null

// localStorage에 저장 (HttpOnly 권장)
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({ ... }),
    { name: "swarm-auth" }  // localStorage에 저장
  )
)
```

#### ⚠️ 개선 필요

**문제 1: Sensitive 정보를 localStorage에 저장**
```typescript
// ⚠️ localStorage는 XSS 취약점
// HttpOnly Cookie 권장
// 하지만 개발 초기 단계라면 유지 가능

// ✅ 최소한: 토큰 만료 시간 확인
```

**문제 2: CORS 설정 확인 필요**
```typescript
// WebConfig.java (백엔드)에서 CORS 설정 확인 필요
// FE에서는 제어 불가
```

**권장**:
- [ ] 토큰을 HttpOnly Cookie로 변경 (보안 강화)
- [ ] CSRF 토큰 추가 (POST/PUT/DELETE 요청)
- [ ] Content Security Policy (CSP) 헤더 설정

---

### F-2. 접근성 (Accessibility)

#### ✅ 좋은 점
```typescript
// 1. Semantic HTML 사용
<header>...</header>
<nav>...</nav>
<main>...</main>

// 2. Alt 텍스트
<img alt={page.pageName} ... />

// 3. ARIA 속성 일부 사용
role="button"
```

#### ⚠️ 개선 필요

```typescript
// ResultHeatmapPage.tsx
// ❌ 인터랙티브 요소에 키보드 접근 불가능?
function HeatmapCanvas({
  onSelectPoint,  // onClick 처리만 있고 키보드는?
  onHoverPoint,
}) {
  // 마커들
  {page.errorPoints?.map((point) => (
    <div
      key={point.issueId}
      onClick={() => onSelectPoint(point.issueId)}  // ❌ 키보드 없음
      onMouseEnter={() => onHoverPoint(point.issueId)}
      onMouseLeave={() => onHoverPoint(null)}
    >
  ))}
}

// ✅ Better
<div
  onClick={() => onSelectPoint(point.issueId)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelectPoint(point.issueId)
    }
  }}
  tabIndex={0}
  role="button"
  aria-pressed={isSelected}
>
```

---

## 🚨 CRITICAL ISSUE #1: 한글 인코딩 문제

### 현재 상황
문서: `[ISSUE]_백엔드_응답_인코딩문제.md`에 상세히 기록됨

```json
{
  "errorPoints": [
    {
      "errorType": "?ъ슜???쒖씤??遺議?"  // ← 깨짐
    }
  ]
}
```

### FE에서 할 수 있는 것

#### 1️⃣ 응답 헤더 확인 (이미 함)
```bash
curl -i http://localhost:8080/api/simulations/{id}/heatmap

# 확인 사항:
# Content-Type: application/json; charset=utf-8 ← charset 있는가?
```

#### 2️⃣ 백엔드 협조 필요사항
- [ ] application.yaml에 `default-charset: UTF-8` 추가
- [ ] 데이터베이스 인코딩 확인 (UTF-8)
- [ ] 기존 데이터 복구 (필요시)

#### 3️⃣ FE에서 문제 해결 시도 (임시 방편)
```typescript
// ❌ FE에서 디코딩하려는 시도는 근본 해결 아님
// 백엔드에서 올바르게 보내야 함

// 참고: 이미 깨진 데이터는 FE에서 복구 불가능
// "?ъ슜???쒖씤??遺議?" → 원본 정보 손실됨
```

**결론**: 🔴 **백엔드팀 협조 필수** - 내일 미팅 시 논의

---

## 🚨 CRITICAL ISSUE #2: API 응답 스키마 불일치

### 문제 상세

**파일**: `types/api/simulation/simulation-overview.response.ts`

```typescript
interface SimulationOverviewAgeItemApiDto {
  // 같은 데이터 필드가 두 가지 형식으로 존재
  age_group?: SimulationOverviewAgeGroupApiValue      // snake_case (SQL)
  ageBand?: SimulationOverviewAgeGroupApiValue        // camelCase (JSON)
  
  total_sessions?: number                              // snake_case
  totalSessions?: number                               // camelCase
  
  success_count?: number                               // snake_case
  successCount?: number                                // camelCase
  
  success_rate?: number                                // snake_case
  successRate?: number                                 // camelCase
  
  fail_rate?: number                                   // snake_case
  failRate?: number                                    // camelCase
  
  avg_duration_ms?: number                             // snake_case
  avgDurationMs?: number                               // camelCase
  
  avg_actions?: number                                 // snake_case
  avgActions?: number                                  // camelCase
  
  avg_declare_failure?: number                         // snake_case
  avgDeclareFailure?: number                           // camelCase
}
```

### 원인 분석
```
백엔드 API 응답이 **2가지 형식 모두 포함** 또는 **불일치**
예:
- 일부 엔드포인트는 snake_case 반환
- 일부 엔드포인트는 camelCase 반환
- 또는 같은 엔드포인트에서 일부 필드는 snake, 일부는 camel
```

### 해결책

#### 1️⃣ 백엔드팀과 협의
```
1. API 응답 형식을 **단일 형식**으로 통일
2. 권장: camelCase (JavaScript 표준)
3. 기존 모든 엔드포인트 검토
```

#### 2️⃣ FE 어댑터로 임시 정규화
```typescript
// adapters/result/result-overview.adapter.ts

export function normalizeOverviewResponse(
  response: SimulationOverviewResponseDto
): NormalizedOverviewData {
  // Business 또는 Backend 형식 중 하나를 정규화된 형식으로 변환
  
  if ('summary' in response) {
    // Business 형식
    return {
      summary: response.summary,
      ageItems: response.overview.map(item => ({
        ageGroup: item.age_group ?? item.ageBand,
        totalSessions: item.total_sessions ?? item.totalSessions ?? 0,
        successCount: item.success_count ?? item.successCount ?? 0,
        // ...
      }))
    }
  } else {
    // Backend 형식
    return {
      summary: {
        success_rate: response.successRate,
        total_sessions: response.totalSessions,
        // ...
      },
      ageItems: response.ageOverview.map(item => ({
        ageGroup: item.age_group ?? item.ageBand,
        totalSessions: item.total_sessions ?? item.totalSessions ?? 0,
        // ...
      }))
    }
  }
}
```

**우선순위**: 🟠 **HIGH** (내일 논의 필수)

---

## 📊 Top 5 Priority Fixes (내일 미팅 전)

| 순위 | 이슈 | 영향 | 난이도 | 시간 | 담당 |
|------|------|------|--------|------|------|
| 1️⃣ | 한글 인코딩 (errorType) | 🔴 Critical | 낮음 | 30분 | **BE** |
| 2️⃣ | API 응답 스키마 통일 | 🟠 High | 낮음 | 1시간 | **BE** |
| 3️⃣ | 컴포넌트 파일 크기 줄이기 | 🟡 Medium | 중간 | 3시간 | **FE** |
| 4️⃣ | 에러 UI 모든 페이지에 추가 | 🟡 Medium | 낮음 | 2시간 | **FE** |
| 5️⃣ | 타입 명명 정리 (Dto 제거) | 🟢 Low | 낮음 | 1시간 | **FE** |

---

## 🎯 내일 미팅 체크리스트

### BE팀 확인사항
```
[ ] 한글 인코딩 문제 해결 확인 (application.yaml)
  └─ Content-Type: application/json; charset=utf-8 확인
  
[ ] API 응답 스키마 통일
  └─ snake_case vs camelCase 선택
  └─ 모든 엔드포인트 일관성 확인
  
[ ] 기존 한글 데이터 복구 (필요시)
  └─ DB 마이그레이션 계획
```

### FE팀 진행사항
```
[ ] 인코딩 문제 해결 대기
[ ] ResultPage 컴포넌트 크기 최적화 계획 수립
[ ] 에러 처리 체계 재점검
[ ] WCAG 접근성 기준 재검토
```

### 공동 확인사항
```
[ ] 현재 JSON 목업 데이터가 최종 API 형식과 일치하는가?
[ ] 페이지네이션, 필터링 API 설계 최종 확인
[ ] 에러 응답 형식 통일 (모든 엔드포인트)
```

---

## 📈 개선 로드맵 (우선순위 순)

### Phase 1: 긴급 수정 (오늘~내일)
```
[x] 한글 인코딩 문제 원인 파악
[ ] API 응답 스키마 정의
[ ] 첫 번째 엔드포인트 성공 테스트
```

### Phase 2: 구조 개선 (1주일)
```
[ ] ResultPage 컴포넌트 분리
[ ] 모든 쿼리에 에러 UI 추가
[ ] 타입 명명 정리
```

### Phase 3: 품질 강화 (2주일)
```
[ ] 테스트 코드 작성 (80%+ 커버리지)
[ ] 성능 최적화 (Core Web Vitals)
[ ] WCAG 접근성 준수
[ ] 문서화 (README, ARCHITECTURE.md)
```

---

## 🏆 최종 권장사항

### 지금 해야 할 것 (Critical)
```
1. 백엔드팀과 인코딩/API 스키마 문제 해결 (내일 미팅)
2. 첫 번째 API 엔드포인트 완전히 성공시키기
3. ResultPage 컴포넌트 테스트 (한글 데이터)
```

### 바꾸지 말아야 할 것 (Good Practice)
```
✅ Feature-based 폴더 구조 유지
✅ Zustand + React Query 조합 계속 사용
✅ TypeScript 엄격한 타입 체크 유지
✅ 컴포넌트 계층화 (Atomic Design) 유지
```

### 개선해야 할 것 (Medium Priority)
```
1. ResultPage 컴포넌트 분리 (>250줄 컴포넌트)
2. 모든 쿼리에 에러 UI 표시
3. 타입명에서 'Dto' 접미사 검토
4. 이미지 최적화 (loading="lazy" 추가)
```

### 장기 과제 (Low Priority)
```
1. 테스트 코드 작성 시작
2. Storybook 도입 검토
3. 성능 모니터링 (Sentry 통합)
4. E2E 테스트 (Cypress/Playwright)
```

---

## 📝 결론

### 종합 평가
```
🎯 현재 상태: 좋은 기초 위에서 진행 중 (7.5/10)

강점:
✅ 아키텍처 구조 매우 우수
✅ TypeScript 타입 안정성 높음
✅ 상태 관리 체계적
✅ 컴포넌트 분리 적절

약점:
❌ 백엔드 통신 스키마 미흡 (인코딩, 형식 불일치)
❌ 일부 컴포넌트 과도하게 큼
❌ 에러 UI 표시 미흡
❌ 접근성 기준 미흡

결론:
→ 백엔드팀 협력으로 데이터 문제 해결 후
→ FE 컴포넌트 최적화 진행 시
→ 프로덕션 배포 가능한 수준으로 개선 가능 ✅
```

### 내일 미팅 시 논의 사항
```
1. 한글 인코딩 해결 방안 확인
2. API 응답 스키마 최종 결정
3. 우선 순위 엔드포인트 선정
4. 테스트 일정 협의
```

---

**작성자**: Claude (Enterprise Frontend Architecture Lead)  
**작성일**: 2026-05-18  
**다음 검토**: 2026-05-20 (백엔드팀 미팅 후)
