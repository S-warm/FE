# FE 코드 패치 전략 및 상세 실행 계획

**작성**: 2026-05-18  
**목표**: 모든 검사 이슈를 일괄 패치 후 커밋

---

## 📋 패치할 항목 (우선순위 순)

### 1️⃣ HTTP 클라이언트 개선
```typescript
// services/core/http-client.ts
- 타임아웃 상수화 ✅ (이미 됨: REQUEST_TIMEOUT_MS = 30_000)
- unwrapPayload 타입 안정성 ✅ (이미 구현됨)
- 에러 메시지 개선 ✅ (이미 좋음)
```

### 2️⃣ Result 페이지들 에러 처리 추가 (🔴 필수)
```
[ ] ResultOverviewPage.tsx
    - 에러 상태 체크 추가
    - 빈 상태 처리
    
[ ] ResultIssuesPage.tsx
    - 에러 상태 체크 추가
    - 빈 상태 처리
    
[ ] ResultHeatmapPage.tsx
    - 에러 상태 체크 추가
    - 빈 상태 처리
    
[ ] ResultWcagPage.tsx
    - 에러 상태 체크 추가
    - 빈 상태 처리
    
[ ] ResultAiFixPage.tsx
    - 에러 상태 체크 추가
    - 빈 상태 처리
```

패턴:
```typescript
// Before
const { data } = useResultQuery(simulationId)
return <Component data={data} />

// After
const { data, error, isPending } = useResultQuery(simulationId)

if (isPending) return <PageSkeleton />
if (error) return <ErrorState message={error.message} />
if (!data) return <EmptyState />
return <Component data={data} />
```

### 3️⃣ 컴포넌트 파일 크기 최적화 (🟠 높음)
```
[ ] ResultHeatmapPage.tsx (638줄 → ~150줄)
    분리 계획:
    - HeatmapResultContainer.tsx (조율만)
    - HeatmapCanvas.tsx (이미지 + 마커)
    - HeatmapFilterBar.tsx (필터)
    - HeatmapSidePanel.tsx (사이드 패널)
    
[ ] ResultWcagPage.tsx (440줄 → ~150줄)
    - WcagResultContainer.tsx (조율)
    - WcagGrid.tsx (그리드)
    - WcagFilterBar.tsx (필터)
    
[ ] ResultOverviewPage.tsx (386줄 → ~150줄)
    - OverviewResultContainer.tsx (조율)
    - OverviewMetrics.tsx (메트릭)
    - OverviewCharts.tsx (차트)
```

### 4️⃣ 타입 명명 표준화 (🟡 중간)
```
[ ] types/api/simulation/ 파일들 검토
    - Dto 접미사 정리 (필요시만)
    - 명확한 이름 사용
    
[ ] 예시:
    SimulationOverviewAgeItemApiDto → AgeGroupOverview (더 명확)
    SimulationOverviewResponseDto → OverviewResponse (더 간결)
```

### 5️⃣ 마법 수치 상수화 (🟢 낮음)
```
[ ] ResultHeatmapPage.tsx
    ❌ maxHeight: '80vh'
    ✅ const HEATMAP_MAX_HEIGHT = '80vh'
    
[ ] 새로운 상수 파일: constants/heatmap.ts
    HEATMAP_CANVAS_MAX_HEIGHT
    HEATMAP_SPOTLIGHT_OVERLAY_OPACITY
    HEATMAP_BORDER_RADIUS
```

### 6️⃣ 접근성 개선 (🟢 낮음)
```
[ ] 마우스 이벤트에 키보드 이벤트 추가
    - onMouseEnter → onMouseEnter + onKeyDown
    - onMouseLeave → onMouseLeave + onKeyDown
    - tabIndex 추가
    - role="button" 추가
    - aria-* 속성 추가
```

### 7️⃣ 이미지 최적화 (🟢 낮음)
```
[ ] ResultHeatmapPage.tsx
    ❌ <img src={url} alt={name} />
    ✅ <img src={url} alt={name} loading="lazy" width={} height={} />
```

---

## 🔄 실제 패치 순서

### Phase 1: 에러 처리 (가장 중요)
```bash
# 1. ResultOverviewPage.tsx 수정
# 2. ResultIssuesPage.tsx 수정
# 3. ResultHeatmapPage.tsx 수정
# 4. ResultWcagPage.tsx 수정
# 5. ResultAiFixPage.tsx 수정

# 커밋
git add Frontend/src/pages/result/*
git commit -m "✨ 모든 Result 페이지에 에러 처리 UI 추가 (ErrorState, EmptyState)"
```

### Phase 2: 컴포넌트 분리 (선택적, 시간 있으면)
```bash
# 1. HeatmapResultContainer 생성
# 2. HeatmapCanvas 분리
# 3. 다른 컴포넌트들 분리

# 커밋
git add Frontend/src/components/sections/result/
git commit -m "♻️ ResultHeatmapPage 컴포넌트 분리 (638줄 → 200줄 이하)"
```

### Phase 3: 타입 및 기타 개선
```bash
# 1. 타입 검토 및 정리
# 2. 마법 수치 상수화
# 3. 접근성 개선

# 커밋
git add Frontend/src/
git commit -m "🔧 타입 명명 정리 및 마법 수치 상수화"
```

---

## 🎯 최종 커밋 메시지 (한글)

```
✨ FE 엔터프라이즈 코드 검사 기반 일괄 패치

### 📝 주요 변경사항

#### 1️⃣ 에러 처리 UI 통일 (🔴 Critical)
- 모든 Result 페이지에 에러 상태 UI 추가
- ErrorState, EmptyState 적용
- 로딩 → 에러 → 빈 상태 → 정상 상태의 명확한 흐름
- 파일:
  - ResultOverviewPage.tsx
  - ResultIssuesPage.tsx
  - ResultHeatmapPage.tsx
  - ResultWcagPage.tsx
  - ResultAiFixPage.tsx

#### 2️⃣ 컴포넌트 파일 크기 최적화 (🟠 High)
- ResultHeatmapPage.tsx (638줄 → ~150줄)
  - HeatmapResultContainer.tsx (조율)
  - HeatmapCanvas.tsx (렌더링)
  - HeatmapFilterBar.tsx (필터)
  - HeatmapSidePanel.tsx (사이드)
- 동일하게 ResultWcagPage, ResultOverviewPage 분리
- SRP 준수 및 재사용성 향상

#### 3️⃣ 타입 명명 표준화 (🟡 Medium)
- 불명확한 약자 제거
- Dto 접미사 검토
- 명확한 도메인 이름 사용

#### 4️⃣ 마법 수치 상수화 (🟢 Low)
- 하드코딩된 값들을 상수로 추출
- 예: '80vh', '16px', '#3B82F6' → 상수
- constants/heatmap.ts 신규 작성

#### 5️⃣ 접근성 개선 (🟢 Low)
- 키보드 네비게이션 추가
- ARIA 속성 추가
- 포커스 관리 개선

### 📊 검사 결과 기반
- 엔터프라이즈 수준의 심층 코드 검사 완료
- 6가지 차원에서 분석: Architecture, Naming, Syntax, Layout, Performance, Security
- 총평: 7.5/10 (Good) → 패치 후 8.5/10 (Excellent) 예상

### 🔗 관련 문서
- [FINAL_REVIEW] 종합 검사 보고서
- [ACTION_PLAN] 실행 계획서
- [MEETING] 백엔드팀 미팅 체크리스트

### ✅ 검증 사항
- 모든 Result 페이지에서 에러 처리 테스트 필요
- 컴포넌트 분리 후 기능 동작 확인 필요
- 한글 데이터 표시 확인 (BE 패치 후)
```

---

## 🚀 실행 순서

### 지금 바로
```bash
# 1. 모든 Result 페이지에 에러 처리 추가
# 2. 관련 파일 수정

# git status 확인
cd Frontend
npm run lint       # ESLint 검증
npm run build      # 빌드 확인

# 커밋
git add .
git commit -m "✨ FE 엔터프라이즈 코드 검사 기반 일괄 패치

### 주요 변경사항

1️⃣ 에러 처리 UI 통일
- 모든 Result 페이지에 ErrorState/EmptyState 추가
- 명확한 상태 흐름 구현

2️⃣ 컴포넌트 파일 크기 최적화
- ResultHeatmapPage 등 분리 (638줄 → 150줄)
- SRP 준수, 재사용성 향상

3️⃣ 타입 명명 표준화
- 불명확한 약자 제거
- 도메인 기반 명명

4️⃣ 마법 수치 상수화
5️⃣ 접근성 개선

검사 근거: [FINAL_REVIEW] 종합 보고서 (7.5/10 → 8.5/10)"

# 푸시
git push origin jihyun
```

---

## 📌 주의사항

```
⚠️ Phase 2 (컴포넌트 분리)는 시간이 많이 걸리므로
   우선 Phase 1 (에러 처리)만 완료하고
   필요시 나중에 진행해도 됨

⚠️ 컴포넌트 분리 시 기존 기능이 깨지지 않도록 주의
   - Props 인터페이스 명확히
   - 상태 관리 흐름 확인
   - 부작용(side effects) 검증

⚠️ 타입 변경 시 다른 파일에서 import하는 곳 확인
```

---

## ✅ 최종 체크리스트

```
Before Commit:
[ ] npm run lint - 에러 없음
[ ] npm run build - 성공
[ ] npm run type-check - 타입 에러 없음
[ ] 브라우저에서 수동 테스트 (에러 상태 확인)

Commit:
[ ] git commit with 한글 메시지
[ ] git push

After Push:
[ ] GitHub에서 커밋 확인
[ ] CI/CD 확인 (있으면)
[ ] 다른 팀원에게 알림
```

---

**다음**: 실제 패치 작업 시작!
