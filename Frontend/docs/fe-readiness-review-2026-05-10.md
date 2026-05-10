# FE 백엔드 통합 직전 점검 리포트

작성일: 2026-05-10
대상 브랜치: `jihyun`
점검자 관점: 프론트엔드 개발자 / API 실연결 직전

---

## 1. 현재 개발 진행도 평가

| 영역 | 진행도 | 비고 |
|---|---|---|
| 기반 구조 (types / adapters / services 인터페이스 / queries / 공통 상태 컴포넌트) | **95%** | Step 1~10 완료 |
| 페이지 소비 구조 (mock 직접 참조 제거 → query/service 기반 소비) | **100%** | Step 11~15 완료. `pages/`, `components/`, `layouts/`, `lib/` 어디에도 `@/mocks` 직접 import 없음 |
| 실 API 연결 레이어 (HTTP 클라이언트, 인증 토큰, 에러 매핑, status polling) | **20%** | 이름만 있고 본체가 없는 영역 |
| **종합 (백엔드 즉시 연결 가능 상태 기준)** | **약 75 ~ 80%** | 구조적 완성도는 매우 높으나, “스위치만 켜면 붙는” 단계는 아직 아님 |

한 줄 요약: **“구조 설계는 완성, 실배선은 미완성”** 단계.

---

## 2. 단계별 점검

### A. 잘 되어 있는 부분 (완료된 스텝)

- `src/types/api/**`, `src/types/view-model/**` 가 모두 분리되어 있음 (raw DTO ↔ view model 경계 명확)
- `src/adapters/**` 가 simulation create / overview / issues / ai-fix / heatmap / wcag 모두 존재
- `src/services/core/service-factory.ts` 에서 `SERVICE_CONFIG.useMockServices` 플래그로 mock ↔ http 스위치 가능한 구조
- `QueryClientProvider`가 `main.tsx`에 정상 마운트, `queryKeys`가 한 곳에 집중 관리됨
- 모든 result 탭과 layout이 query hook 기반으로 동작 (`useResultOverviewQuery`, `useResultIssuesQuery`, `useResultHeatmapQuery`, `useResultWcagQuery`, `useResultAiFixQuery`, `useSimulationHeaderQuery`, `useSimulationListQuery`)
- `SimulationSetupPage`의 submit 흐름이 `validate → mapper → mutation → navigate` 으로 깔끔히 정리됨
- `PageSkeleton / ResultPageSkeleton / ErrorState / InlineError / EmptyState` 공통 상태 컴포넌트가 모든 페이지에 일관되게 적용됨
- `ApiServiceError` 클래스가 BE의 `GlobalExceptionHandler` 응답 shape (`status / error / message / path`) 와 1:1 매칭
- `result-page-param.ts` 등 lib 계층도 mock 의존 제거 완료

### B. 부족한 부분 (현재, API 연결 직전 막아야 할 것)

#### B-1. **실 HTTP 클라이언트가 아예 없음 (가장 큰 블로커)**
- `*.http.service.ts` 파일이 별도로 존재하지 않음. `simulation.mock.service.ts` 등 mock 파일 안에 `simulationHttpService`라는 이름으로 같이 export 되고 있고, 본체는 전부 `createNotImplementedServiceError(...)` 만 throw.
- `fetch` / `axios` / interceptor / baseURL 기반 공통 클라이언트가 코드베이스 전체에 없음.
- 즉 `VITE_USE_MOCK_SERVICES=false`로 토글하는 순간 모든 API가 501로 떨어짐.

#### B-2. **환경변수 이름 불일치 — 토글 시 즉시 깨질 잠재 버그**
- `service-config.ts` 는 `VITE_DEFAULT_USER_ID` 를 읽음.
- `.env.local` 에는 `VITE_API_USER_ID`, `VITE_USER_ID_SEED` 만 있음.
- 결과적으로 실 API 모드에서 userId가 조용히 `"mock-user"` 로 fallback. → 모든 쿼리가 잘못된 사용자로 호출됨.

#### B-3. **인증 / 토큰 / 401 흐름 부재**
- `auth.store.ts` 가 하드코딩된 `admin / 123` 더미 로그인. JWT, refresh token, Authorization 헤더 주입 로직 없음.
- 401 응답 시 자동 재발급 또는 로그인 화면 리다이렉트 인터셉터 없음.
- 실제 사용자 id가 auth state에서 흘러야 하는데, 지금은 `SERVICE_CONFIG.defaultUserId` (env 상수) 로 흐름.

#### B-4. **서버 검증 에러를 폼 필드로 되돌리는 로직 없음**
- 클라이언트 검증 (`validateSimulationSetupForm`) 만 존재.
- BE가 400으로 `path` / `message` 단위 에러를 보내도 현재는 `submitError` 한 줄짜리 배너로만 표시. 필드별 `errors.targetUrl` 등에 매핑되지 않음.

#### B-5. **SimulationProcessPage가 가짜 타이머**
- 0.9초마다 tick 증가 → 4단계 가짜 진행 → redirect. 실제 status API/polling 미연결.
- 생성 응답 id 기반 진입은 OK. 다음 작업: `useSimulationStatusQuery(simulationId)` + `refetchInterval`.

#### B-6. **persona device 매핑이 단방향 + 손실 있음**
- FE 폼: `mac / windows / iphone / android / ipad / android_tablet` (6종)
- BE enum: `desktop / mobile / tablet` (3종)
- `mapSimulationFormPersonaDeviceToApiDevice` 만 존재 → 보낸 후 다시 받아오면 원래 디바이스 종류를 복원할 수 없음.
- 결과 화면이 “원본 디바이스”를 표시해야 한다면 정책 결정 필요 (BE에 6종 추가 vs FE가 추가 필드로 보관 vs 단순화).

#### B-7. **`endUrl` 이 FE-only**
- `simulation-draft.store.ts` 에 보관되고, `SimulationSetupPage`에서 검증까지 됨.
- 그러나 `mapSimulationFormToCreateRequest` 가 `endUrl` 을 DTO에 넣지 않음. BE `SimulationCreateRequestDto` 에도 필드 없음.
- 둘 중 하나로 결정 필요: (a) BE에 추가 요청, (b) FE-only 메타로 명시하고 검증에서 빼기.

#### B-8. **`SimulationCreateResponseDto.status` 와 `SimulationListItemDto.status` 가 `string` (enum 아님)**
- `simulation.mock.service.ts` 는 항상 `"completed"` 만 반환.
- 실 API는 `pending / running / completed / failed` 등이 올 수 있으며, 사이드바 / 헤더가 status에 따라 다른 UI를 그려야 한다면 enum 타입 + view model 매핑이 추가되어야 함.

#### B-9. **WCAG / Heatmap 어댑터 정책 미확정 (문서에 이미 표시됨)**
- WCAG: 현재는 simulation-level → page-level 복제 정책. 실 API 응답이 page-level WCAG라면 `result-wcag.adapter.ts` 수정 필요.
- Heatmap: 좌표 / 분포 / pagination 정책이 mock 기반. 실 응답과 비교해 한 번 더 맞춰야 함.

#### B-10. **부수적으로 정리하면 좋을 것**
- `ResultLayoutPage`의 “PDF 다운로드” / “공유하기” 버튼이 클릭 시 아무 동작 없음 (placeholder 그대로).
- React Query `staleTime: 30_000`, `retry: 1` 이 한 곳에 고정. 결과 탭별로 다르게 가져갈 일이 있을지 정책 정리 필요.
- `flow-list.store.ts` 는 mock seed 그대로지만 페이지 직접 참조가 없으므로 운영상 OK (문서대로 유지 가능).

### C. 앞으로 해야 할 과정 (실 API 등장 후 순서)

1. **공통 HTTP 클라이언트 도입** — `src/services/core/http-client.ts` (fetch 래퍼 + baseURL + 공통 헤더 + 에러 정규화 → `ApiServiceError` throw).
2. **인증 토큰 / userId 흐름 정리** — auth.store에 token / userId 저장, http-client에서 Authorization 자동 주입, 401 인터셉터.
3. **`*.http.service.ts` 파일 분리 및 실구현** — `simulation.http.service.ts`, `result-overview.http.service.ts` 등 6개. 현재 mock 파일에 같이 들어있는 stub을 빼서 본체로 채움.
4. **env 변수 정합화** — `.env.local`의 `VITE_API_USER_ID` → `VITE_DEFAULT_USER_ID` 로 키 이름 통일하거나, `service-config.ts` 가 두 키 모두 읽도록 fallback 추가.
5. **mutation 에러 → 폼 필드 매핑** — `ApiServiceError.path` / `message` 를 `SimulationSetupValidationErrors` 로 되돌리는 헬퍼 추가.
6. **simulation status polling** — `useSimulationStatusQuery` + `refetchInterval` 도입, `SimulationProcessPage`가 가짜 타이머 대신 status를 따라 진행.
7. **WCAG / Heatmap 어댑터 실응답 기준 보정** — 실 데이터 받아 1회 비교 후 보정.
8. **persona device / endUrl 정책 확정** — BE와 합의해 둘 중 하나로 정리.
9. **status enum 타입화 + 사이드바/헤더 status 표시 정책 결정**.
10. **PDF 다운로드 / 공유 엔드포인트 연결** (요구사항에 있다면).

---

## 3. 다음 단계 AI 프롬프트

아래 프롬프트는 위 “부족한 부분 B-1 ~ B-3”를 한 묶음으로 처리하기 위한 것. **HTTP 클라이언트 + env 정합화 + auth 토큰 주입** 까지 한 번에 끝내면, 그 다음부터는 각 `*.http.service.ts` 본체만 쓰면 된다.

```text
너는 우리 프론트엔드의 백엔드 통합 직전 작업을 맡은 시니어 엔지니어다.
지금 코드베이스는 types / view-model / adapters / queries / mock service 까지 다 깔려 있고,
페이지에서 mock 직접 참조도 모두 제거된 상태다.
다만 실제로 “mock 토글을 끄면” 동작할 수 있는 HTTP 레이어가 비어 있다.

이번 작업의 목표는 다음 3가지를 한 묶음으로 끝내는 것이다.

[목표]
1. 공통 HTTP 클라이언트 도입
2. env 변수 / userId 흐름 정합화
3. 인증 토큰 주입과 401 흐름 골격 마련

[반드시 참고할 소스]
- src/services/core/service-config.ts
- src/services/core/api-service-error.ts
- src/services/core/service-factory.ts
- src/services/simulation/simulation.mock.service.ts (안에 simulationHttpService stub이 같이 있다)
- src/services/result/*.mock.service.ts (각 파일 안에 *HttpService stub이 같이 있다)
- src/types/api/common/api-error.ts
- src/store/auth.store.ts
- .env.local

[작업]
1) src/services/core/http-client.ts 를 새로 만든다.
   - fetch 기반 래퍼.
   - SERVICE_CONFIG.apiBaseUrl 을 baseURL 로 사용.
   - 공통 Content-Type: application/json.
   - Authorization 헤더는 auth.store 에서 token 을 읽어 자동 주입.
   - 응답이 ok 가 아니면 BE 응답 shape (status/error/message/path) 를 그대로 ApiErrorResponse 로 파싱해서 ApiServiceError 로 throw.
   - 401 응답이면 auth.store.logout() 후 ApiServiceError 그대로 throw.
   - GET / POST / PUT / DELETE 가 가능한 얇은 메서드 4개만 노출.

2) env 정합화
   - .env.local 의 VITE_API_USER_ID 를 VITE_DEFAULT_USER_ID 로 통일하거나,
   - service-config.ts 가 VITE_DEFAULT_USER_ID ?? VITE_API_USER_ID 둘 다 읽도록 fallback 을 넣는다.
   - 어떤 방향을 선택했는지 코멘트로 남겨라.

3) auth.store.ts 확장
   - user 객체에 token: string | null 필드 추가 (지금은 null 로 시작).
   - login(username, token?) 시 token 도 저장.
   - logout 은 token 도 클리어.
   - 기존 더미 admin/123 흐름은 유지하되, token 자리만 만들어둔다 (실제 토큰 발급은 BE 인증 API 연결 시 채운다).
   - 주의: persist 미들웨어가 이미 적용되어 있으므로 storage key 와 partialize 처리에 주의한다.

4) 기존 *Http*Service stub 분리
   - 지금은 simulationHttpService 가 simulation.mock.service.ts 안에 같이 들어있다.
   - simulation.http.service.ts 같은 별도 파일을 6개 만든다 (simulation, result-overview, result-issues, result-ai-fix, result-heatmap, result-wcag).
   - 각 파일은 일단 createNotImplementedServiceError 를 그대로 throw 해도 된다 (본체는 다음 단계에서 채운다).
   - service-factory.ts 의 import 경로를 새 파일로 교체한다.
   - mock 파일에서는 *HttpService export 를 제거한다.

[작업 원칙]
- 페이지나 query hook 은 절대 수정하지 않는다.
- 변경 범위는 services/core, services/<도메인>/*.http.service.ts, store/auth.store.ts, .env.local 또는 service-config.ts 로 한정한다.
- 타입은 ApiServiceError, ApiErrorResponse 를 그대로 사용한다.
- 실제 fetch 호출 본체 (예: simulationHttpService.createSimulation 안의 POST 호출) 는 이번 단계에서는 채우지 않는다. 다음 단계의 일이다.

[완료 후 보고]
- 새로 추가/이동된 파일 목록
- service-factory.ts 가 바라보는 import 경로 변화
- env 변수 정합화 방향
- 다음 단계 (각 *.http.service.ts 본체 구현) 에서 손댈 파일 리스트
- 잠재 리스크 (persist 충돌, baseURL trailing slash 등)
```

이걸 그대로 넣고 끝나면, 다음 단계는 “각 도메인별 `*.http.service.ts` 본체 구현 + simulation status polling 연결” 두 가지로 매우 짧게 마무리된다.
