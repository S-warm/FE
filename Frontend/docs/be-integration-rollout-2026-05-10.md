# 백엔드 통합 단계 진행 현황 + 다음 단계 프롬프트

작성일: 2026-05-10
관점: 프론트엔드 / 백엔드 실연결 직전

---

## 1. 한 화면 요약 — 지금 어디에 서 있는가

```
[과거]   기반 구조 설계        ──────────  완료 (Step 1 ~ 10)
         페이지 mock 참조 제거   ──────────  완료 (Step 11 ~ 15)
[지금]   HTTP 레이어 골격       ──────────  ✅ Step 16 완료 (이번 단계)
[가까운 미래] 인증 / 토큰 발급 ─────────  ⏳ Step 17
              서비스 본체 구현  ─────────  ⏳ Step 18
              에러 → 폼 매핑   ─────────  ⏳ Step 19
              status polling   ─────────  ⏳ Step 20
[먼 미래]  WCAG / Heatmap 정책 보정 ───  ⏳ Step 21
          PDF / 공유 / persona 6→3 ───  ⏳ Step 22 (정책)
```

현재 위치: **Step 16 (HTTP 레이어 골격) 완료 직후**.
목표 도달까지 남은 큰 단계는 **인증 본체 + 서비스 본체**, 두 묶음.

---

## 2. 이번 단계(Step 16)에서 실제로 한 일

### 2-1. 새로 추가된 파일

- `src/services/core/http-client.ts`
  - fetch 래퍼. `SERVICE_CONFIG.apiBaseUrl` 기반.
  - `Authorization: Bearer <token>` 자동 주입 (auth.store 에서 token 읽음).
  - 401 응답 시 `useAuthStore.getState().logout()` 호출 후 ApiServiceError throw.
  - `ApiErrorResponse` shape (status / error / message / path) 그대로 파싱.
  - `httpClient.get / post / put / delete` 4종.
- `src/services/simulation/simulation.http.service.ts`
- `src/services/result/result-overview.http.service.ts`
- `src/services/result/result-issues.http.service.ts`
- `src/services/result/result-ai-fix.http.service.ts`
- `src/services/result/result-heatmap.http.service.ts`
- `src/services/result/result-wcag.http.service.ts`

(http.service.ts 는 모두 stub. 본체는 Step 18 에서 채운다.)

### 2-2. 수정된 파일

- `src/services/core/service-config.ts`
  - `VITE_DEFAULT_USER_ID → VITE_API_USER_ID → VITE_USER_ID_SEED → "mock-user"` 순서로 fallback.
- `src/services/core/service-factory.ts`
  - import 경로를 새 `*.http.service.ts` 로 분리.
- `src/services/index.ts`
  - `httpClient`, `HttpRequestOptions`, `HttpClient` 타입 export 추가.
- `src/services/simulation/simulation.mock.service.ts`
- `src/services/result/*.mock.service.ts` × 5
  - 같이 들어 있던 `*HttpService` stub 과 사용하지 않게 된 `createNotImplementedServiceError` import 제거.
- `src/store/auth.store.ts`
  - `AuthUser.token: string | null` 추가.
  - `login(username, token?)` 시그니처.
  - `logout()` 이 자동으로 token 까지 클리어.
  - persist `version: 1` + `migrate` + `partialize` 로 v0 → v1 자동 마이그레이션.
- `.env.local`
  - `VITE_DEFAULT_USER_ID` 정식 키 추가 + 레거시 키 유지.

### 2-3. 검증

- `npx tsc -b --noEmit --force` → exit 0.
- `npx eslint .` → exit 0.
- `vite build` 는 sandbox 의 native rollup 모듈 환경 문제로 실패 (Windows 에서 설치된 node_modules). 코드 문제 아님.

---

## 3. 무엇이 바뀌었나 — 기존 흐름 vs 지금

| 영역 | 직전 상태 | 현재 상태 |
|---|---|---|
| HTTP 클라이언트 | 없음 (어디에도 fetch 래퍼 없음) | `src/services/core/http-client.ts` 존재 |
| http stub 위치 | `*.mock.service.ts` 안에 같이 있음 | `*.http.service.ts` 로 6개 분리 |
| service-factory 가 보는 import | mock 파일 한 곳 | mock + http 파일 두 곳 |
| token 필드 | 없음 | `AuthUser.token` + persist v1 마이그레이션 |
| Authorization 헤더 | 없음 | http-client 가 매 요청마다 자동 주입 |
| 401 핸들링 | 없음 | http-client 가 logout() 후 throw |
| env userId 키 | `VITE_DEFAULT_USER_ID` 만 | `VITE_DEFAULT_USER_ID → API_USER_ID → USER_ID_SEED` fallback |
| 페이지 / query hook | (미수정) | (미수정) — 이번 단계에서 손대지 않음 |

---

## 4. 다음 단계들의 작업 설계 (지엽적 보고)

각 단계는 **수정 범위 / 입력 / 산출 / 리스크** 4축으로만 정리.

### Step 17. 인증 / 토큰 발급 흐름 연결

- 수정 범위: `src/services/auth/**` (신규), `src/store/auth.store.ts`, `LoginPage.tsx`, `SignUpPage.tsx`.
- 입력: BE 인증 API 명세 (login / signup / refresh).
- 산출: `authService` (login / refresh / me), `useLoginMutation`, `LoginPage` 가 더미 admin/123 대신 실제 token 받아 store 에 저장.
- 리스크: refresh token 정책 미정 / 401 후 자동 재발급 vs 강제 로그아웃 정책.

### Step 18. 각 *.http.service.ts 본체 구현

- 수정 범위: `src/services/simulation/simulation.http.service.ts`, `src/services/result/*.http.service.ts` × 5.
- 입력: BE 엔드포인트 명세 (URL, method, query, request body, response shape).
- 산출: 각 메서드가 `httpClient.get/post/...` 호출 후 adapter 거쳐 view model 반환. mock 토글을 꺼도 페이지가 동작.
- 리스크: WCAG 가 simulation-level vs page-level 인지 응답 받아본 뒤 adapter 미세 조정 필요.

### Step 19. 서버 검증 에러 → 폼 필드 매핑

- 수정 범위: `src/validation/simulation-setup.ts`, `src/pages/SimulationSetupPage.tsx`, (선택) `src/services/core/api-service-error.ts`.
- 입력: BE 의 `path` 와 `message` 컨벤션 (필드 이름이 path 에 들어오는지, 별도 fieldErrors 배열인지).
- 산출: `ApiServiceError` 의 path/message 를 `SimulationSetupValidationErrors` 로 환원하는 `mapApiErrorToFormErrors(error)` 헬퍼.
- 리스크: BE 가 다중 필드 에러를 단일 message 로 합쳐 보내면 파싱 규칙이 fragile 해짐.

### Step 20. SimulationProcessPage status polling 연결

- 수정 범위: `src/services/simulation/simulation.service.ts` (인터페이스에 `getSimulationStatus` 추가), 두 구현체, `src/queries/simulation/use-simulation-status-query.ts` (신규), `src/pages/SimulationProcessPage.tsx`.
- 입력: BE status API (예: GET `/simulations/{id}/status`).
- 산출: 가짜 `setInterval` 제거. `useQuery({ refetchInterval })` 가 status 따라 step indicator 갱신, 완료 시 결과 페이지로 redirect.
- 리스크: 폴링 간격 정책 (1s / 3s / backoff), 취소된 시뮬레이션 종료 처리.

### Step 21. WCAG / Heatmap 어댑터 실응답 보정

- 수정 범위: `src/adapters/result/result-wcag.adapter.ts`, `src/adapters/result/result-heatmap.adapter.ts`, (필요 시) 해당 view model 타입.
- 입력: 실 API 응답 1회 캡처.
- 산출: simulation-level → page-level 복제 정책이 필요 없어졌다면 제거. heatmap 좌표 / pagination 정책 일치화.
- 리스크: UI 가 가정한 page 단위 표시 방식이 실 응답에서 보장 안 되면 view 레벨 수정도 발생할 수 있음.

### Step 22. 잔여 정책 결정 (페이지 손대기 전)

- persona device 6종 → BE 3종 매핑 확정 (양방향 / 단방향 / FE-only 보조필드).
- `endUrl` BE 추가 vs FE-only 명시.
- simulation status enum 타입화 + 사이드바 / 헤더 표시 정책.
- “PDF 다운로드” / “공유하기” 버튼이 살아 있을지 결정.

---

## 5. 다음 단계 AI 프롬프트 — 그대로 복붙

각 단계를 별도 세션으로 돌리는 게 안전하다.
프롬프트 끝에 “완료 후 보고” 섹션이 들어 있어 진행 상황을 저장해 두기 좋다.

### 5-1. Step 17 프롬프트 — 인증 / 토큰 흐름 연결

```text
너는 우리 프론트엔드의 백엔드 통합 단계 담당이다.
이전 단계 (Step 16) 에서 다음이 이미 끝났다.
- src/services/core/http-client.ts (fetch 래퍼, Authorization 자동 주입, 401 logout) 도입
- src/services/core/service-factory.ts 가 *.http.service.ts 분리 import 로 정리
- src/services/{simulation,result}/*.http.service.ts 6개 stub 생성
- src/store/auth.store.ts 에 token: string|null 추가, persist v1 migrate 적용
- service-config.ts 가 VITE_DEFAULT_USER_ID → VITE_API_USER_ID → VITE_USER_ID_SEED fallback

이번 단계 (Step 17) 의 목표는 “인증 / 토큰 발급 흐름을 실제 BE 와 잇기 위한 골격을 만드는 것” 이다.

[반드시 참고할 소스]
- src/services/core/http-client.ts
- src/services/core/api-service-error.ts
- src/services/core/service-factory.ts
- src/store/auth.store.ts
- src/pages/LoginPage.tsx
- src/pages/SignUpPage.tsx
- BE 인증 API 명세 (login / signup / refresh / me)

[작업]
1) src/services/auth/auth.service.ts 인터페이스를 만든다.
   - login(input): Promise<LoginResponseDto>
   - signup(input): Promise<SignupResponseDto>
   - refresh(): Promise<RefreshResponseDto>
   - me(): Promise<MeResponseDto>
2) src/services/auth/auth.mock.service.ts 와 src/services/auth/auth.http.service.ts 를 만든다.
   - mock: 기존 admin/123 흐름을 그대로 살린 token 발급 시뮬레이션.
   - http: httpClient.post/get 사용. 본체 구현.
3) src/types/api/auth/** 에 request / response DTO 타입을 분리한다.
4) src/queries/auth/use-login-mutation.ts, use-signup-mutation.ts 를 추가한다.
   - onSuccess 시 useAuthStore.getState().login(username, token) 호출.
5) LoginPage / SignUpPage 가 위 mutation 을 사용하도록 교체한다.
   - 더미 검증 흐름은 mock service 가 흡수한다.
6) 401 시 logout 만 하던 http-client 흐름은 그대로 둔다 (refresh 자동화는 다음 단계).
7) service-factory.ts 에 authService = useMockServices ? authMockService : authHttpService 를 추가한다.
8) services/index.ts 에 authService export 를 추가한다.

[작업 원칙]
- 페이지 디자인 / 마크업은 변경하지 않는다 (이벤트 핸들러만 교체).
- token 저장 위치는 auth.store 단일 출처를 유지한다.
- BE 응답 shape 가 미정이라면 합리적인 기본 shape (accessToken, expiresIn, user) 으로 잡되 코멘트로 남긴다.

[완료 후 보고]
- 새 파일 / 수정 파일 목록
- BE 명세 미정 부분의 가정값
- 다음 단계 (Step 18, 각 도메인 http 서비스 본체 구현) 에서 손댈 파일 리스트
- 잠재 리스크 (refresh 정책, 다중 탭, persist 버전 v2 필요 여부)
```

### 5-2. Step 18 프롬프트 — 도메인 HTTP 서비스 본체 구현

```text
너는 우리 프론트엔드의 백엔드 통합 단계 담당이다.
이전까지 다음이 끝났다.
- http-client 도입 (src/services/core/http-client.ts)
- *.http.service.ts 6개 stub 생성
- 인증 / 토큰 흐름 골격 (Step 17)

이번 단계 (Step 18) 의 목표는 “6개 stub 의 본체를 채워서, useMockServices=false 로 토글해도 페이지가 동작하게 만드는 것”이다.

[반드시 참고할 소스]
- src/services/core/http-client.ts
- src/services/core/api-service-error.ts
- src/services/{simulation,result}/*.service.ts (인터페이스)
- src/services/{simulation,result}/*.mock.service.ts (현재 동작 기준)
- src/types/api/simulation/** (DTO)
- src/adapters/{simulation,result}/** (DTO → view model 변환)
- BE 엔드포인트 명세 (URL / method / query / body / response)

[작업]
1) simulation.http.service.ts
   - createSimulation: POST /simulations (body = SimulationCreateRequestDto, header X-User-Id 또는 인증 토큰 정책)
   - getSimulationList: GET /users/{userId}/simulations
   - getSimulationHeader: GET /simulations/{simulationId}
   - 응답을 SimulationCreateResponseDto / SimulationListItemViewModel / ResultHeaderViewModel 로 변환.
2) result-overview.http.service.ts
   - GET /simulations/{simulationId}/overview → adaptOverviewResponseToViewModel
3) result-issues.http.service.ts
   - GET /simulations/{simulationId}/issues → adaptIssuesResponseToViewModel
4) result-ai-fix.http.service.ts
   - GET /simulations/{simulationId}/ai-fix → adaptAiFixResponseToViewModel
5) result-heatmap.http.service.ts
   - GET /simulations/{simulationId}/heatmap?ageGroup&page&size → adaptHeatmapResponseToViewModel
6) result-wcag.http.service.ts
   - GET /simulations/{simulationId}/wcag → adaptWcagResponseToViewModel (page context 정책 코멘트로 남김)

[작업 원칙]
- mock service 와 동일한 view model 을 반환해야 한다 (페이지가 변하지 않는다).
- adapter 에 raw DTO 를 그대로 흘려 넣는다. 서비스 안에서 추가 가공하지 않는다.
- 모든 HTTP 호출은 httpClient 만 사용한다.
- 에러는 ApiServiceError 그대로 throw 되는 것을 가정한다 (try/catch 추가하지 않음).

[완료 후 보고]
- 변경된 파일 목록
- BE 명세와 mock 의 shape 차이가 있었다면 어디를 어떻게 보정했는지
- 페이지 / 어댑터 추가 수정이 발생했다면 사유
- 다음 단계 (Step 19, 서버 검증 에러 → 폼 필드 매핑) 진입 전 점검 포인트
```

### 5-3. Step 19 프롬프트 — 서버 검증 에러 → 폼 필드 매핑

```text
너는 SimulationSetupPage 의 검증 흐름을 백엔드 응답과 결합하는 담당이다.
현재는 클라이언트 검증 (validateSimulationSetupForm) 만 동작하고, BE 가 400 으로 보낸 에러는
ErrorState 배너 한 줄로만 표시된다.

이번 단계 (Step 19) 의 목표는 "ApiServiceError 를 SimulationSetupValidationErrors 로 환원해서
실패한 필드 옆에 inline 으로 표시하는 것" 이다.

[반드시 참고할 소스]
- src/services/core/api-service-error.ts
- src/types/api/common/api-error.ts
- src/validation/simulation-setup.ts
- src/pages/SimulationSetupPage.tsx
- src/queries/simulation/use-create-simulation-mutation.ts
- BE 의 GlobalExceptionHandler 응답 shape (status / error / message / path) 와 fieldErrors 표현 방식

[작업]
1) src/validation/api-error-to-form.ts 를 만든다.
   - mapApiErrorToSimulationSetupErrors(error: unknown): SimulationSetupValidationErrors
   - ApiServiceError 의 path 와 message 패턴을 보고 가능한 한 필드별 에러로 환원한다.
   - 매핑이 불가능한 메시지는 일반 submitError 로 fallback.
2) SimulationSetupPage 의 catch 블록에서 위 헬퍼를 호출하고, errors state 와 submitError 를 동시에 갱신한다.
3) 환원할 수 없는 에러는 기존 ErrorState 로 노출.
4) 가능한 BE 응답 패턴이 여러 개라면 (단일 message vs fieldErrors 배열) 두 케이스를 모두 다룬다.

[작업 원칙]
- 폼 마크업은 수정하지 않는다.
- 새 헬퍼는 순수 함수로 작성하고 단위 테스트가 가능한 형태로 둔다.

[완료 후 보고]
- 새 파일 / 수정 파일
- BE 응답 패턴별 매핑 규칙
- fallback 정책
- 다음 단계 (Step 20, status polling) 의 사전 정리 사항
```

### 5-4. Step 20 프롬프트 — status polling 연결

```text
너는 SimulationProcessPage 의 가짜 타이머를 status polling 으로 교체하는 담당이다.

[반드시 참고할 소스]
- src/pages/SimulationProcessPage.tsx
- src/queries/simulation/use-create-simulation-mutation.ts
- src/services/simulation/simulation.service.ts (인터페이스)
- src/services/simulation/simulation.mock.service.ts
- src/services/simulation/simulation.http.service.ts
- BE status API 명세

[작업]
1) SimulationService 인터페이스에 getSimulationStatus(simulationId): Promise<SimulationStatusViewModel> 추가.
2) mock 구현체는 setInterval 비슷한 단계적 진행을 호출 횟수에 따라 흉내낸다.
3) http 구현체는 GET /simulations/{simulationId}/status 호출.
4) src/queries/simulation/use-simulation-status-query.ts 를 만든다.
   - useQuery + refetchInterval 사용.
   - 완료 / 실패 status 에서는 refetch 중단.
5) SimulationProcessPage 의 setInterval 을 제거하고 query 결과로 step indicator / progress 를 그린다.
6) 완료 status 에서 buildResultOverviewPath 로 redirect.

[작업 원칙]
- 폴링 간격은 상수로 분리한다.
- 페이지 디자인은 변경하지 않는다.

[완료 후 보고]
- 새 파일 / 수정 파일
- 폴링 간격 / backoff 정책
- 실패 status 의 UI 처리 방식
```

### 5-5. Step 21 프롬프트 — WCAG / Heatmap 어댑터 실응답 보정

```text
너는 결과 어댑터를 실 API 응답 기준으로 보정하는 담당이다.

[반드시 참고할 소스]
- src/adapters/result/result-wcag.adapter.ts
- src/adapters/result/result-heatmap.adapter.ts
- src/types/api/simulation/simulation-wcag.response.ts
- src/types/api/simulation/simulation-heatmap.response.ts
- 실 API 응답 1회 캡처 (요청 후 받은 raw JSON)

[작업]
1) WCAG 가 simulation-level 그대로 오는지 page-level 로 오는지 확인.
2) page-level 로 온다면 현재의 page context 복제 로직을 제거하고 직접 매핑.
3) Heatmap 좌표 정규화 (0~1 vs 0~100), pagination, currentAgeGroup 표현 방식이 일치하는지 검증.
4) 차이가 있다면 adapter 에서 흡수, view model 변경이 필요하면 최소한으로 반영.

[완료 후 보고]
- 변경된 정책
- 페이지 / 컴포넌트 사이드 수정 여부
- 잔여 위험
```

---

## 6. 진행 현황 한눈에 (도장판)

| Step | 내용 | 상태 |
|---|---|---|
| 1 ~ 10 | 기반 (types / adapters / service if / queries / states) | ✅ |
| 11 ~ 15 | 페이지 mock 직접 참조 제거 | ✅ |
| 16 | HTTP 클라이언트 + http stub 분리 + auth.store token | ✅ (이번 단계) |
| 17 | 인증 / 토큰 발급 흐름 연결 | ⏳ 다음 |
| 18 | *.http.service.ts 본체 구현 | ⏳ |
| 19 | 서버 검증 에러 → 폼 필드 매핑 | ⏳ |
| 20 | SimulationProcessPage status polling | ⏳ |
| 21 | WCAG / Heatmap adapter 실응답 보정 | ⏳ |
| 22 | persona / endUrl / status enum / PDF 등 정책 결정 | ⏳ |

