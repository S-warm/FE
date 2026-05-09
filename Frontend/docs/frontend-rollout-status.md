# 프론트 점진적 실장 현황

최종 업데이트: 2026-05-09
브랜치: `jihyun`

## 이번 단계의 목표

- 백엔드 통합 직전 상태로 마감하고, 실제 API 연결 시 프론트 수정 범위를 최소화한다.
- 공용 컴포넌트와 store의 잔여 `mock` 직접 참조를 정리한다.
- 실제 백엔드 연결 시 손댈 범위를 문서로 고정한다.

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

### 실제 교체 완료 영역

아래 파일은 새 구조로 교체 완료됐다.

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
- 페이지 연결도 완료
- 공용 컴포넌트와 store의 잔여 직접 참조도 정리 완료
- 따라서 현재 상태는 “백엔드 통합 직전 점검 완료” 단계다

## 리스크

### 1. 실제 백엔드 연결 전까지 HTTP 구현체는 미완성

- `src/services/**/*.http.service.ts`

현재는 mock service가 동작하고, 실제 fetch 구현체는 이후 백엔드 완성 시 연결한다.

### 2. WCAG / Heatmap은 adapter 정책 확인이 필요

- WCAG는 simulation-level raw를 page-level context로 복제
- Heatmap은 집계 point 기반 렌더링

실제 API 응답이 확정되면 adapter에서 한 번 더 맞춰볼 필요가 있다.

### 3. process 페이지는 status polling API 연결이 남아 있음

- 생성 응답 id 기반 진입은 완료
- 이후 polling/query 연결은 status API가 준비되면 추가

## 다음 단계

실제 백엔드 연결 단계에서는 아래 순서로 보면 된다.

1. `types/api` 최종 DTO 반영
2. `http service` 구현
3. `adapter` 세부 정책 조정
4. `process status` polling 연결

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

### 추가 완료

- Step 10. 실제 페이지 단위 교체 준비
- Step 11. 공통 진입점 교체
- Step 12. 생성 플로우 실연결
- Step 13. 결과 탭 1차 교체
- Step 14. 결과 탭 2차 교체
- Step 15. 공용 컴포넌트 및 최종 점검
