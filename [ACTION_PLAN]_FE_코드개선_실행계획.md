# 🚀 FE 코드 개선 실행계획
**작성**: 2026-05-18  
**대상**: SWARM Frontend Team  
**목표**: 내일 백엔드팀 미팅 후 즉시 실행 가능한 개선안

---

## 📋 즉시 실행 과제 (1주일 이내)

### 과제 1: 한글 인코딩 문제 해결
**담당**: BE팀 + FE팀  
**우선순위**: 🔴 CRITICAL  
**예상 시간**: 2-4시간

#### BE팀 체크리스트
```yaml
# 1. application.yaml 수정 (10분)
spring:
  jackson:
    default-charset: UTF-8
    serialization:
      write-dates-as-timestamps: false
    deserialization:
      fail-on-unknown-properties: false
    time-zone: Asia/Seoul

# 2. WebConfig.java 수정 (15분)
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(
            new MediaType("application", "json", StandardCharsets.UTF_8)
        );
    }
}

# 3. 데이터베이스 확인 (20분)
psql -U swarm -d swarmDB -c "SELECT datname, pg_encoding_to_char(encoding) FROM pg_database WHERE datname='swarmDB';"
# 결과: UTF8이어야 함

# 4. 기존 데이터 복구 (필요시, 30-60분)
UPDATE error_point 
SET error_type = convert_from(convert_to(error_type, 'UTF8'), 'LATIN1')
WHERE error_type LIKE '%?%';

# 5. 테스트 (20분)
curl http://localhost:8080/api/simulations/{id}/heatmap | json_pp
# errorType에 한글이 제대로 보여야 함
```

#### FE팀 대기 및 검증
```typescript
// 해결 후 즉시 테스트
const testHeatmapData = async () => {
  const response = await fetch('/api/simulations/test-id/heatmap')
  const data = await response.json()
  
  console.log('Raw response:', data)
  console.log('First error type:', data.errorPoints?.[0]?.errorType)
  
  // 한글이 정상 표시되어야 함
  // "버튼 클릭 불가" 또는 "텍스트 입력 오류" 같은 실제 한글
  
  return data.errorPoints?.[0]?.errorType?.includes('?') === false
}
```

---

### 과제 2: API 응답 스키마 통일
**담당**: BE팀  
**우선순위**: 🟠 HIGH  
**예상 시간**: 1-2시간

#### 현재 문제
```typescript
// types/api/simulation/simulation-overview.response.ts
interface SimulationOverviewAgeItemApiDto {
  // 같은 필드가 2가지 형식으로 존재
  age_group?: SimulationOverviewAgeGroupApiValue       // snake_case
  ageBand?: SimulationOverviewAgeGroupApiValue         // camelCase
  total_sessions?: number                               // snake_case
  totalSessions?: number                                // camelCase
  // ... 더 많은 중복
}
```

#### BE팀 대응
```
1. 모든 API 응답 형식 검토
2. snake_case 또는 camelCase 중 하나 선택 (권장: camelCase)
3. 모든 엔드포인트에 일관되게 적용
4. 응답 예시 문서 업데이트
```

#### FE팀 대응 (일시적 정규화)
```typescript
// adapters/result/result-overview.adapter.ts (신규 파일)

export interface NormalizedOverviewResponse {
  summary: {
    successRate: number
    totalSessions: number
    avgDurationMs: number
    successCount: number
  }
  ageItems: {
    ageGroup: string
    totalSessions: number
    successCount: number
    successRate: number
    failRate: number
    avgDurationMs: number
    avgActions: number
    avgDeclareFailure: number
  }[]
}

export function normalizeOverviewResponse(
  response: SimulationOverviewResponseDto
): NormalizedOverviewResponse {
  if ('summary' in response) {
    // Business API 형식
    return {
      summary: response.summary,
      ageItems: response.overview.map(item => ({
        ageGroup: item.age_group ?? item.ageBand ?? 'Unknown',
        totalSessions: item.total_sessions ?? item.totalSessions ?? 0,
        successCount: item.success_count ?? item.successCount ?? 0,
        successRate: item.success_rate ?? item.successRate ?? 0,
        failRate: item.fail_rate ?? item.failRate ?? 0,
        avgDurationMs: item.avg_duration_ms ?? item.avgDurationMs ?? 0,
        avgActions: item.avg_actions ?? item.avgActions ?? 0,
        avgDeclareFailure: item.avg_declare_failure ?? item.avgDeclareFailure ?? 0,
      }))
    }
  }

  // Backend API 형식
  return {
    summary: {
      successRate: response.successRate,
      totalSessions: response.totalSessions,
      avgDurationMs: response.avgDurationMs,
      successCount: response.successCount,
    },
    ageItems: response.ageOverview.map(item => ({
      ageGroup: item.age_group ?? item.ageBand ?? 'Unknown',
      totalSessions: item.total_sessions ?? item.totalSessions ?? 0,
      successCount: item.success_count ?? item.successCount ?? 0,
      successRate: item.success_rate ?? item.successRate ?? 0,
      failRate: item.fail_rate ?? item.failRate ?? 0,
      avgDurationMs: item.avg_duration_ms ?? item.avgDurationMs ?? 0,
      avgActions: item.avg_actions ?? item.avgActions ?? 0,
      avgDeclareFailure: item.avg_declare_failure ?? item.avgDeclareFailure ?? 0,
    }))
  }
}
```

```typescript
// services/result/result-overview.service.ts (수정)

export const resultOverviewService = {
  getOverview: async (simulationId: string) => {
    const rawResponse = await requestJson<SimulationOverviewResponseDto>(
      `/api/simulations/${simulationId}/overview`
    )
    
    // ✅ 항상 정규화된 형식으로 반환
    return normalizeOverviewResponse(rawResponse)
  }
}
```

---

### 과제 3: 컴포넌트 파일 크기 최적화
**담당**: FE팀  
**우선순위**: 🟡 MEDIUM  
**예상 시간**: 3-4시간

#### 현재 문제 파일들
```
ResultHeatmapPage.tsx:      638줄  ❌
ResultWcagPage.tsx:         440줄  ❌
ResultOverviewPage.tsx:     386줄  ❌
ResultAiFixPage.tsx:        292줄  ❌
ResultIssuesPage.tsx:       289줄  ❌
```

#### 개선 전략

**예시: ResultHeatmapPage.tsx (638줄 → 150줄 분할)**

```typescript
// Before: pages/result/ResultHeatmapPage.tsx (638줄)
// - 필터링 UI
// - 캔버스 렌더링
// - 마커 렌더링
// - 사이드 패널
// - 상태 관리
// 모두 한 파일에...

// After: 분리된 구조

// 1. pages/result/ResultHeatmapPage.tsx (100줄 - 조율만)
import { HeatmapResultContainer } from '@/components/sections/result/heatmap'

export default function ResultHeatmapPage() {
  const { simulationId } = useParams()
  return <HeatmapResultContainer simulationId={simulationId} />
}

// 2. components/sections/result/heatmap/HeatmapResultContainer.tsx (150줄)
import { useState } from 'react'
import { useResultHeatmapQuery } from '@/queries'
import { HeatmapFilterBar } from './HeatmapFilterBar'
import { HeatmapGrid } from './HeatmapGrid'
import { HeatmapSidePanel } from './HeatmapSidePanel'

export function HeatmapResultContainer({ simulationId }: Props) {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const { data, isLoading, error } = useResultHeatmapQuery(simulationId)

  if (isLoading) return <ResultPageSkeleton />
  if (error) return <ErrorState message={error.message} />
  if (!data) return <EmptyState />

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <HeatmapFilterBar />
        <HeatmapGrid 
          data={data}
          selectedPointId={selectedPointId}
          onSelectPoint={setSelectedPointId}
        />
      </div>
      {selectedPointId && (
        <HeatmapSidePanel 
          pointId={selectedPointId}
          data={data}
        />
      )}
    </div>
  )
}

// 3. components/sections/result/heatmap/HeatmapGrid.tsx (200줄)
// 캔버스와 마커 렌더링만 담당
export function HeatmapGrid({ data, selectedPointId, onSelectPoint }: Props) {
  // 이미지 로드, 마커 위치 계산만
}

// 4. components/sections/result/heatmap/HeatmapFilterBar.tsx (100줄)
// 필터링 UI만 담당
export function HeatmapFilterBar() { ... }

// 5. components/sections/result/heatmap/HeatmapSidePanel.tsx (150줄)
// 사이드 패널만 담당
export function HeatmapSidePanel() { ... }

// 6. components/sections/result/heatmap/index.ts
export * from './HeatmapResultContainer'
export * from './HeatmapGrid'
export * from './HeatmapFilterBar'
export * from './HeatmapSidePanel'
```

#### 컴포넌트 분리 체크리스트
```typescript
// 분리 기준
[ ] 200줄 이상 → 분리 검토
[ ] 2개 이상의 독립적인 UI 섹션 → 분리
[ ] 복잡한 상태 관리 로직 → Custom Hook으로 추출
[ ] 반복되는 렌더링 패턴 → Sub 컴포넌트화
```

---

### 과제 4: 에러 처리 UI 통일
**담당**: FE팀  
**우선순위**: 🟡 MEDIUM  
**예상 시간**: 2시간

#### 현재 문제
```typescript
// ❌ 에러 체크 없이 데이터만 렌더링
const { data } = useQuery(...)
return <Component data={data} />

// ❌ 또는 에러만 로깅
const { data, error } = useQuery(...)
if (error) console.error(error)
return <Component data={data} />
```

#### 표준 패턴 수립
```typescript
// ✅ 모든 쿼리에 적용할 표준 패턴

import { ErrorState, PageSkeleton } from '@/components/states'

export function ResultOverviewPage() {
  const simulationId = useSimulationIdFromUrl()
  const { data, error, isPending } = useResultOverviewQuery(simulationId)

  // 1️⃣ 로딩 상태
  if (isPending) {
    return <PageSkeleton />
  }

  // 2️⃣ 에러 상태 (중요!)
  if (error) {
    return (
      <ErrorState
        title="데이터를 불러올 수 없습니다"
        message={error.message}
        action={{
          label: '다시 시도',
          onClick: () => window.location.reload()
        }}
      />
    )
  }

  // 3️⃣ 빈 상태
  if (!data || data.length === 0) {
    return <EmptyState />
  }

  // 4️⃣ 정상 상태
  return <OverviewContent data={data} />
}
```

#### 에러 UI 컴포넌트 (이미 있음)
```typescript
// components/states/error-state.tsx (이미 존재)
export function ErrorState({ 
  title, 
  message, 
  action 
}: Props) {
  return (
    <div className="grid place-items-center min-h-96">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4" size={48} />
        <h2 className="text-h4-semibold mb-2">{title}</h2>
        <p className="text-text-secondary mb-4">{message}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
```

#### 모든 결과 페이지 점검 리스트
```
[ ] ResultOverviewPage.tsx - 에러 UI 추가
[ ] ResultIssuesPage.tsx - 에러 UI 추가
[ ] ResultHeatmapPage.tsx - 에러 UI 추가
[ ] ResultWcagPage.tsx - 에러 UI 추가
[ ] ResultAiFixPage.tsx - 에러 UI 추가
```

---

### 과제 5: 타입 명명 정리
**담당**: FE팀  
**우선순위**: 🟢 LOW  
**예상 시간**: 1-2시간

#### 현재 문제
```typescript
// ❌ Dto 접미사가 너무 많음
type SimulationOverviewAgeGroupApiValue      // 너무 긺
interface SimulationOverviewSummaryApiDto   // ApiDto?
interface SimulationOverviewAgeItemApiDto   // 중복
interface SimulationOverviewBusinessResponseDto
interface SimulationOverviewBackendResponseDto
```

#### 개선안
```typescript
// ✅ 명확하고 간결한 명명

// 1. API 응답 타입 (이미 정규화됨)
interface OverviewResponse {
  summary: OverviewSummary
  ageItems: AgeGroupOverview[]
}

interface OverviewSummary {
  successRate: number
  totalSessions: number
  avgDurationMs: number
  successCount: number
}

interface AgeGroupOverview {
  ageGroup: string
  totalSessions: number
  successCount: number
  successRate: number
  // ...
}

// 2. 이전 형식 지원 (마이그레이션 기간)
type SimulationOverviewResponseDto =
  | SimulationOverviewBusinessResponseDto
  | SimulationOverviewBackendResponseDto

// 3. 타입 재정의 (점진적 마이그레이션)
// 새 코드는 명확한 이름 사용
// 기존 코드는 gradual migration
```

---

## 📊 1주일 실행 계획표

| 일자 | 과제 | 담당 | 체크리스트 |
|------|------|------|-----------|
| **5/18** | 인코딩 문제 파악 | BE | [ ] 원인 분석 |
| **5/18-19** | 인코딩 문제 해결 | BE | [ ] application.yaml 수정<br/>[ ] 테스트 |
| **5/19** | API 스키마 협의 | BE+FE | [ ] 최종 형식 결정 |
| **5/19-20** | 어댑터 작성 | FE | [ ] normalizeOverviewResponse 완성 |
| **5/20** | 컴포넌트 분리 | FE | [ ] ResultHeatmapPage 분리<br/>[ ] 다른 페이지들 |
| **5/21** | 에러 UI 추가 | FE | [ ] 모든 페이지에 ErrorState 추가 |
| **5/22** | 타입 정리 | FE | [ ] 새로운 타입 정의<br/>[ ] 문서화 |
| **5/23** | 최종 테스트 | FE | [ ] 모든 페이지 수동 테스트<br/>[ ] 한글 데이터 확인 |

---

## 🛠 개발 환경 확인사항

### 필수 도구 확인
```bash
# Node.js 버전
node --version    # v18+ 권장

# npm 버전
npm --version     # v9+ 권장

# TypeScript
npx tsc --version # v5+

# ESLint 설정 확인
cat Frontend/.eslintrc.json | grep "exhaustive-deps"

# Prettier 설정 확인
cat Frontend/.prettierrc.json
```

### 권장 추가 설정

#### .eslintrc.json 확인
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",  // ✅ 의존성 배열 검증
    "@typescript-eslint/no-explicit-any": "error",  // ✅ any 타입 금지
    "no-console": ["warn", { "allow": ["warn", "error"] }]  // ✅ 개발 로그 제한
  }
}
```

#### Prettier 설정
```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 📚 참고 자료

### 컴포넌트 분리 패턴
- https://react.dev/learn/sharing-state-between-components
- https://kentcdodds.com/blog/colocation

### TypeScript 베스트 프랙티스
- https://www.typescriptlang.org/docs/handbook/

### 한글 인코딩
- https://www.w3.org/International/questions/qa-what-is-encoding

### 에러 처리
- https://tanstack.com/query/latest/docs/react/guides/important-defaults

---

## ✅ 체크리스트 (매일 아침 확인)

```
[ ] 어제 완료된 과제 확인
[ ] 현재 진행 중인 과제 진행률 확인
[ ] 블로킹 이슈 확인 (BE팀 협조 필요)
[ ] 오늘의 작은 목표 설정 (3-5개)
[ ] EOD에 진행률 업데이트
```

---

**작성**: 2026-05-18  
**마지막 업데이트**: 매일 업데이트 필요  
**담당자**: FE팀 리드
