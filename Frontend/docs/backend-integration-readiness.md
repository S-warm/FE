# 백엔드 통합 직전 점검

최종 업데이트: 2026-05-09
브랜치: `jihyun`

## 완료 판정

- `page / layout / lib / components` 기준의 직접 `mock` 참조는 제거 완료
- 결과 페이지군은 `query -> service -> adapter -> view model` 흐름으로 동작
- 실제 백엔드 연결 시 주 수정 지점은 `types/api`, `services/http`, `adapters`로 제한 가능

## 남아 있는 mock 참조 목록

아래 참조는 개발용 mock 데이터 공급 계층이라 유지한다.

### mock service 구현체

- `src/services/simulation/simulation.mock.service.ts`
- `src/services/result/result-overview.mock.service.ts`
- `src/services/result/result-issues.mock.service.ts`
- `src/services/result/result-ai-fix.mock.service.ts`
- `src/services/result/result-heatmap.mock.service.ts`
- `src/services/result/result-wcag.mock.service.ts`

### mock 데이터 파일 내부 참조

- `src/mocks/**`

위 항목은 백엔드 연결 전까지 남아 있어도 구조상 문제 없다.

## 실제 API 연결 시 수정될 파일 범위

### 1. API 타입

- `src/types/api/**`

### 2. HTTP 서비스 구현체

- `src/services/simulation/*.http.service.ts`
- `src/services/result/*.http.service.ts`
- `src/services/core/service-config.ts`

### 3. Adapter

- `src/adapters/simulation/**`
- `src/adapters/result/**`

## 예외적으로 확인이 필요한 정책

### WCAG

- 현재 raw는 simulation-level
- FE는 page-level side panel에 맞추기 위해 adapter에서 page context로 복제
- 백엔드가 page-level WCAG를 주면 `result-wcag.adapter.ts`만 수정하면 된다

### Heatmap

- 현재 FE는 adapter가 만든 집계 point 기반으로 렌더링
- 좌표, 분포, pagination 정책이 바뀌면 `result-heatmap.adapter.ts`와 `result-heatmap.http.service.ts` 중심으로 수정한다

### Simulation Process

- 현재는 생성 응답 기반 simulation id로 진입하고 임시 타이머 구조를 유지
- status polling API가 생기면 `SimulationProcessPage.tsx`에 query 연결만 추가하면 된다

## store mock 의존 판단

- `flow-list.store.ts`의 외부 mock import는 제거 완료
- store 초기 seed는 개발용 데이터로 내부 상수 유지
- 이 정도는 실무상 백엔드 연결 리스크로 보지 않는다

## 최종 체크리스트

- `npm run lint`
- `npm run build`
- `rg "@/mocks" src` 실행 시 page/layout/lib/components 기준 직접 참조가 없는지 확인

## 최종 결론

현재 프론트는 **백엔드 완성 후 즉시 연결 가능한 상태에 매우 가깝다.**

백엔드 연결 시 우선 수정 대상은 아래 3개 축으로 제한된다.

1. `src/types/api/**`
2. `src/services/**/*.http.service.ts`
3. `src/adapters/**`
