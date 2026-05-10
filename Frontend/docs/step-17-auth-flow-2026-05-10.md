# Step 17 — 인증 / 토큰 발급 흐름 골격 완료

작성일: 2026-05-10
직전 단계: Step 16 (HTTP 클라이언트 + http stub 분리 + auth.store token)
다음 단계: Step 18 (각 *.http.service.ts 본체 구현)

---

## 1. 결과 요약

- TypeScript: `tsc -b --noEmit --force` exit 0
- ESLint: `eslint .` exit 0
- 페이지 마크업 변경 없음. **이벤트 핸들러만 교체.**

---

## 2. 변경 파일 목록

### 새로 추가

```
src/types/api/auth/
  ├─ auth-user.ts
  ├─ auth-login.request.ts
  ├─ auth-login.response.ts
  ├─ auth-signup.request.ts
  ├─ auth-signup.response.ts
  ├─ auth-refresh.response.ts
  ├─ auth-me.response.ts
  └─ index.ts

src/services/auth/
  ├─ auth.service.ts          # AuthService 인터페이스
  ├─ auth.mock.service.ts     # admin/123 흐름 + token 발급 시뮬레이션
  ├─ auth.http.service.ts     # POST /auth/login, signup, refresh + GET /auth/me
  └─ index.ts

src/queries/auth/
  ├─ use-login-mutation.ts    # onSuccess 시 useAuthStore.login(username, accessToken) + invalidate
  ├─ use-signup-mutation.ts   # 동일 + token 없으면 로그인 화면으로
  └─ index.ts
```

### 수정

```
src/services/core/service-factory.ts
  + authService = useMockServices ? authMockService : authHttpService

src/services/index.ts
  + export authService

src/queries/index.ts
  + export * from "@/queries/auth"

src/components/sections/auth/login-panel.tsx
  - useAuthStore canLogin / login 직접 호출 제거
  + useLoginMutation + ApiServiceError 분기 처리
  + isPending / isTransitioning 결합한 isSubmitting 상태

src/components/sections/auth/signup-panel.tsx
  - 빈 onSubmit 제거 (이전엔 검증 / 호출 모두 없었음)
  + useSignupMutation + 클라이언트 검증 + 409/400 분기 처리
  + token 응답 유무에 따라 자동 로그인 vs 로그인 화면 이동
```

---

## 3. BE 명세 미정 부분의 가정값

| 영역 | 가정 | 근거 / 회수 포인트 |
|---|---|---|
| 로그인 키 | `username + password` | UI placeholder 가 "아이디" 임. 이메일이면 키만 변경 |
| 로그인 응답 | `{ accessToken, tokenType?, expiresIn?, refreshToken?, user }` | 가장 흔한 JWT 응답. cookie 기반이면 refreshToken 옵셔널로 둠 |
| signup 응답 | `AuthLoginResponseDto` 동형 (자동 로그인) | 프론트에서 token 유무로 분기하므로 BE 정책 변경 가능 |
| refresh 응답 | accessToken 만 (user 미포함) | user 동봉되면 옵셔널 필드로 확장 |
| 401 처리 | http-client 가 logout 후 throw (현재 단계) | refresh 자동화는 Step 17 이후로 미룸 |
| Authorization | `Authorization: Bearer <token>` | http-client 가 매 요청 시점 store 읽음 |

---

## 4. 동작 흐름

### 4-1. 로그인 (mock)

1. LoginPanel 제출 → 클라이언트 검증 (빈 값 체크)
2. `useLoginMutation().mutate({ username, password })`
3. mock service: admin/123 만 통과. 그 외엔 status 401 ApiServiceError throw
4. onSuccess: `useAuthStore.getState().login(username, accessToken)` → token 까지 store 에 저장 → invalidateQueries
5. LOGIN_TRANSITION_MS 후 `/generate` 로 navigate

### 4-2. 로그인 (http)

1. 동일하게 mutate
2. `httpClient.post<AuthLoginResponseDto>("/auth/login", input)`
3. 401 응답이면 http-client 가 `useAuthStore.logout()` 한 뒤 ApiServiceError throw → mutation onError 가 받음
4. 그 외 onSuccess 흐름은 mock 과 동일

### 4-3. 회원가입

1. SignUpPanel 제출 → 클라이언트 검증 (빈 값 + 비번 일치)
2. `useSignupMutation().mutate({ username, password })`
3. response.accessToken 있으면 자동 로그인 + `/generate` 이동
4. 없으면 `onGoToLogin()` 호출 (BE 가 별도 로그인 단계를 요구하는 경우)
5. 409 → 아이디 중복, 400 → 입력값 오류, 그 외 → 일반 에러로 분기

---

## 5. 다음 단계 (Step 18) 에서 손댈 파일

각 stub 의 본체를 채우면 된다. 인터페이스는 이미 확정.

```
src/services/simulation/simulation.http.service.ts
src/services/result/result-overview.http.service.ts
src/services/result/result-issues.http.service.ts
src/services/result/result-ai-fix.http.service.ts
src/services/result/result-heatmap.http.service.ts
src/services/result/result-wcag.http.service.ts
```

확인이 같이 필요한 파일:

```
src/types/api/simulation/**         # BE 명세 대비 DTO 정합성
src/adapters/simulation/**          # raw → view model 변환 미세 조정
src/adapters/result/**              # 동일
```

---

## 6. 잠재 리스크

### 6-1. refresh 정책

- 현재 401 → 즉시 logout. 사용자 경험에서 갑작스러운 로그아웃 가능.
- 다음 단계에서 다음 중 하나로 보강:
  - http-client 가 401 시 `authService.refresh()` 한 번 시도 후 재요청
  - 만료 임박 시 (expiresIn 기반) 백그라운드 refresh

### 6-2. 다중 탭

- `swarm-auth` localStorage 키를 사용. 한 탭에서 logout 시 다른 탭은 자동 동기화되지 않음.
- 필요하면 `storage` 이벤트 리스너로 탭 간 sync 추가.

### 6-3. persist 버전 v2 필요 여부

- v1 에서는 `user.token` 만 추가했음.
- refreshToken 을 store 에 저장하기로 결정하면 v2 migrate 가 필요.
- httpOnly cookie 로 두면 v1 유지 가능.

### 6-4. mock service 의 자동 로그인

- mock signup 이 곧바로 token 을 발급 → 회원가입 즉시 generate 페이지로 진입.
- BE 가 이메일 검증 등 별도 단계가 있다면 mock 의 동작이 실제와 달라질 수 있음. 이 경우 mock 의 accessToken 을 비워서 흐름을 일치시킨다.

---

## 7. 진행 도장판

| Step | 내용 | 상태 |
|---|---|---|
| 1–10 | 기반 구조 | ✅ |
| 11–15 | 페이지 mock 직접 참조 제거 | ✅ |
| 16 | HTTP 클라이언트 + http stub 분리 + auth.store token | ✅ |
| **17** | **인증 / 토큰 발급 흐름 골격** | **✅ 이번 단계** |
| 18 | *.http.service.ts 본체 구현 | ⏳ 다음 |
| 19 | 서버 검증 에러 → 폼 필드 매핑 | ⏳ |
| 20 | SimulationProcessPage status polling | ⏳ |
| 21 | WCAG / Heatmap adapter 실응답 보정 | ⏳ |
| 22 | persona / endUrl / status enum / PDF 정책 | ⏳ |
