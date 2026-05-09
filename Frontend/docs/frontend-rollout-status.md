# 프론트 점진적 실장 현황

최종 업데이트: 2026-05-09
브랜치: `jihyun`

## 이번 단계의 목표

- 앞에서 만든 `types / adapters / services / query / states` 계층이 코드베이스에 실제로 어느 정도 반영됐는지 점검한다.
- 아직 `mock` 직접 참조가 남아 있는 페이지와 공용 컴포넌트를 식별한다.
- 다음 실장 순서를 다시 고정해서, 이후 작업이 분석이 아니라 실제 교체 중심으로 진행되게 만든다.

## 수정 대상 파일

- [frontend-rollout-status.md](/Users/bluepaper14/Documents/01_개발/03_swarm/FE/Frontend/docs/frontend-rollout-status.md)

## 적용 방식

### 완료된 기반 작업

아래 계층은 이미 코드로 반영되어 있다.

1. `src/types/api/**`
   - simulation create/list/result DTO 타입 생성 완료
2. `src/types/view-model/**`
   - simulation/result 공용 view model 타입 생성 완료
3. `src/adapters/**`
   - simulation create mapper
   - result overview/issues/ai-fix/heatmap/wcag adapter
4. `src/services/**`
   - service interface
   - mock service 구현체
   - http service placeholder
5. `src/queries/**`
   - QueryClientProvider
   - query keys
   - simulation/result query hooks
6. `src/components/states/**`
   - `PageSkeleton`
   - `ResultPageSkeleton`
   - `ErrorState`
   - `InlineError`

### 아직 실제 교체가 안 된 영역

아래 파일은 여전히 `mock`를 직접 참조한다.

#### simulation / layout

- `src/layouts/AuthLayout.tsx`
- `src/pages/SimulationProcessPage.tsx`
- `src/pages/result/ResultLayoutPage.tsx`
- `src/lib/result-page-param.ts`

#### result pages

- `src/pages/result/ResultOverviewPage.tsx`
- `src/pages/result/ResultIssuesPage.tsx`
- `src/pages/result/ResultAiFixPage.tsx`
- `src/pages/result/ResultWcagPage.tsx`
- `src/pages/result/ResultHeatmapPage.tsx`

#### shared components

- `src/components/charts/donut-chart.tsx`
- `src/components/charts/horizontal-bar-chart.tsx`
- `src/components/charts/heatmap-grid.tsx`
- `src/components/sections/issue-card.tsx`
- `src/components/sections/summary-panel.tsx`

### 현재 구조 해석

- 기반 계층은 준비 완료
- 페이지 연결은 아직 미완료
- 따라서 현재 상태는 “설계/골격 완료, 실제 소비처 교체 전” 단계다

## 리스크

### 1. 서비스와 쿼리는 준비됐지만 페이지가 아직 사용하지 않음

- `useSimulationListQuery`
- `useSimulationHeaderQuery`
- `useCreateSimulationMutation`
- `useResultOverviewQuery`
- `useResultIssuesQuery`
- `useResultAiFixQuery`
- `useResultHeatmapQuery`
- `useResultWcagQuery`

위 hook들은 이미 생성됐지만, 현재 페이지에서 아직 소비하지 않는다.

### 2. result page selection이 여전히 mock page 목록에 묶여 있음

- `src/lib/result-page-param.ts`

이 파일을 먼저 교체하지 않으면 result pages 전체가 새 구조로 넘어가기 어렵다.

### 3. 공용 차트 컴포넌트가 mock 타입을 import 중

페이지만 바꿔도 chart/section 공용 컴포넌트가 mock 타입에 묶여 있어서 최종 분리가 완성되지 않는다.

### 4. heatmap은 마지막 교체가 맞음

기존 FE는 세션 로그 기반이고, 새 service/adapters는 집계 포인트 기반이라 구조 차이가 가장 크다.

## 다음 단계

실제 실장 순서는 아래처럼 진행한다.

1. `simulation list / sidebar` 교체
   - `AuthLayout.tsx`
   - `useSimulationListQuery`
2. `simulation create` 교체
   - `SimulationSetupPage.tsx`
   - `useCreateSimulationMutation`
3. `result header / page param` 교체
   - `ResultLayoutPage.tsx`
   - `result-page-param.ts`
   - `useSimulationHeaderQuery`
4. `overview` 교체
5. `issues` 교체
6. `ai-fix` 교체
7. `wcag` 교체
8. `heatmap` 교체
9. 공용 chart/section 타입 정리

## 단계별 완료 판정

### 완료

- Step 1. 타입 베이스 생성
- Step 2. service 인터페이스와 공통 에러 구조 생성
- Step 3. 입력/폼 매핑 adapter 생성
- Step 4. 생성 폼 검증 로직 정리
- Step 5. 결과 탭 공통 데이터 모델 정리
- Step 6. 결과 탭 adapter 골격 생성
- Step 7. mock service 구현체 연결
- Step 8. React Query 골격 연결
- Step 9. 공통 상태 컴포넌트 추가

### 미완료

- Step 10. 실제 페이지 단위 교체

즉 Step 10은 아직 “진행 시작 전 점검 완료” 상태이며,
다음부터는 문서/설계가 아니라 아래 순서로 바로 교체 작업에 들어간다.

1. sidebar
2. create
3. result layout/header
4. overview
5. issues
6. ai-fix
7. wcag
8. heatmap
