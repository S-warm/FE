# FE 백엔드 통합 현황 점검 리포트

작성일: 2026-05-10
대상 브랜치: `codex/fe-jihyun-latest`
관점: 프론트엔드 개발자 / 백엔드 실연결 직전 점검

## 1. 한 줄 결론

현재 프론트엔드는 백엔드 통합을 위한 구조 설계와 핵심 연결 골격이 대부분 완료된 상태다.
다만 "바로 스위치만 켜면 끝" 수준의 최종 마감은 아니고, 실응답 검증과 정책 확정이 조금 더 남아 있다.

실무 기준 진행도:

| 영역 | 진행도 | 판정 |
|---|---:|---|
| 타입 / 어댑터 / 서비스 / 쿼리 기반 구조 | 100% | 완료 |
| 페이지의 mock 직접 참조 제거 | 100% | 완료 |
| HTTP / 인증 / 서비스 본체 연결 | 90% | 핵심 완료 |
| 서버 검증 에러와 상태 polling | 95% | 완료에 가까움 |
| 실 API 응답 기준 최종 보정 | 60% | raw 응답 확인 필요 |
| 정책성 잔여 항목 정리 | 40% | 백엔드 협의 필요 |
| 종합 | 90% 내외 | 백엔드 통합 직전 단계 |

## 2. 현재 코드 기준 실제 단계 판정

과거 문서상 Step 16 직후로 적혀 있던 구간보다 현재 코드는 더 진행되어 있다.
실제 브랜치 상태 기준 판정은 아래가 맞다.

| Step | 내용 | 현재 상태 |
|---|---|---|
| 1 ~ 10 | 기반 구조 설계 | 완료 |
| 11 ~ 15 | 페이지 mock 직접 참조 제거 | 완료 |
| 16 | HTTP 클라이언트 + http stub 분리 | 완료 |
| 17 | 인증 / 토큰 흐름 골격 | 완료 |
| 18 | 도메인 HTTP 서비스 본체 구현 | 완료 |
| 19 | 서버 검증 에러 -> 폼 필드 매핑 | 완료 |
| 20 | SimulationProcessPage status polling | 완료 |
| 21 | WCAG / Heatmap 실응답 기준 보정 | 부분 완료 |
| 22 | persona / endUrl / status enum / PDF / 공유 정책 | 미완료 |

## 3. 완료된 설계와 구현

### 3-1. 기반 구조

- `src/types/api/**`, `src/types/view-model/**` 분리 완료
- `src/adapters/**` 계층 도입 완료
- `src/services/**` 인터페이스 + mock/http 구현 분리 완료
- `@tanstack/react-query` 기반 query hook 구조 완료
- `loading / empty / error` 공통 상태 컴포넌트 구조 완료

### 3-2. 페이지 소비 구조

- `pages / layouts / components / lib` 기준 mock 직접 import 제거 완료
- 결과 탭 전체가 query -> service -> adapter -> view-model 흐름으로 전환 완료
- `SimulationSetupPage`가 `validation -> mapper -> mutation -> navigate` 흐름으로 정리됨
- `SimulationProcessPage`가 가짜 타이머 대신 status polling 기반으로 교체됨

### 3-3. 백엔드 통합 골격

- `src/services/core/http-client.ts` 도입
- `Authorization: Bearer <token>` 자동 주입
- 401 시 `logout()` 처리
- `ApiServiceError` 기반 에러 정규화
- `simulation/result/*.http.service.ts` 본체 구현 완료
- `auth.service` + login/signup mutation + store token 흐름 연결 완료
- `ApiServiceError -> SimulationSetupValidationErrors` 매핑 완료

## 4. 현재 부족한 부분

### A. 실응답 기준 최종 확정이 덜 된 부분

1. WCAG 응답 정책
- 현재 DTO와 adapter는 simulation-level 응답을 가정한다.
- 실제 백엔드가 page-level WCAG를 내려주면 `result-wcag.adapter.ts`와 DTO를 다시 맞춰야 한다.

2. Heatmap 응답 최종 검증
- 좌표 정규화는 `0~1`, `0~100` 둘 다 수용하도록 반영되어 있다.
- 하지만 `currentAgeGroup`, `pagination`, `errorPoints` 구조가 실제 raw JSON과 완전히 일치하는지는 아직 확정되지 않았다.

### B. 정책 결정이 남은 부분

1. persona device 6종 -> BE 3종
- 현재 FE는 `mac/windows/iphone/android/ipad/android_tablet`
- 현재 API request는 `desktop/mobile/tablet`
- 생성 요청은 보내지지만, 결과나 이력 화면에서 원래 디바이스 의미를 복원할 정책은 아직 정리되지 않았다.

2. `endUrl` 처리 정책
- FE 폼과 draft store에는 존재한다.
- 하지만 `SimulationCreateRequestDto`에는 포함되지 않는다.
- FE-only 필드로 유지할지, BE에 추가 요청할지 확정이 필요하다.

3. status enum 정책
- polling view-model은 `pending/running/completed/failed`로 정리되어 있다.
- 반면 simulation list/header 등 다른 지점의 status 표시는 아직 전역 정책으로 완전히 통일됐다고 보긴 어렵다.

4. PDF 다운로드 / 공유 버튼
- 결과 레이아웃 버튼 UI는 존재하지만 실제 동작은 아직 placeholder다.

### C. 운영 안정화 관점의 잔여 항목

1. refresh token 자동화
- 현재는 401 시 logout만 한다.
- refresh 자동 재발급 정책은 아직 붙지 않았다.

2. 실 API raw 샘플 보관
- Step 21 성격의 보정 작업은 raw JSON 1회 캡처가 있어야 정확히 끝낼 수 있다.

## 5. 지금 상태를 어떻게 판정할 것인가

### 결론

"프론트가 백엔드 통합 직전까지 완료되었는가?"에 대한 답은 `예, 거의 맞다`이다.

다만 엄밀하게는 아래처럼 보는 것이 가장 정확하다.

- `핵심 구조와 주요 기능 연결은 이미 백엔드 직전 수준까지 완료`
- `실응답 검증과 정책 정리는 아직 남아 있음`
- `즉, 통합 시작은 가능하지만 통합 완료 판정은 아직 이름`

실무적으로는 다음처럼 표현하는 것이 적절하다.

> 현재 프론트는 백엔드 실연결을 시작할 준비가 끝난 상태이며,
> 실제 API 응답 확인과 정책 확정까지 마치면 통합 완료 상태로 넘어갈 수 있다.

## 6. 다음 통합 순서

### 1순위: 실응답 검증

1. 로그인 / 회원가입 / 생성 / status / overview / issues / ai-fix / heatmap / wcag 응답 raw JSON 확보
2. DTO와 adapter가 실제 응답과 맞는지 확인
3. 차이가 나면 `types/api`, `adapters`, 필요 시 `services`만 수정

### 2순위: 정책 확정

1. persona device 매핑 방향 확정
2. `endUrl` FE-only 유지 여부 확정
3. status 표시 규칙 확정
4. PDF / 공유 기능 유지 여부 확정

### 3순위: 운영 안정화

1. refresh token 정책 확정
2. 401 재시도 / 강제 로그아웃 UX 정리
3. 실제 배포 환경의 baseURL / CORS / 인증 헤더 정책 검증

## 7. 다음 단계 AI 프롬프트

아래 프롬프트는 현재 코드 상태를 기준으로 바로 이어서 사용할 수 있게 정리했다.

### 프롬프트 A. 실 API 응답 기준 최종 보정

```text
너는 우리 프론트엔드의 백엔드 실연결 검증 담당이다.
현재 프론트는 query/service/adapter/http-client/polling 구조까지 연결되어 있고,
이제 실제 백엔드 raw 응답과 현재 DTO/adapter를 맞추는 마지막 점검 단계다.

[반드시 참고할 소스]
- src/types/api/**
- src/adapters/**
- src/services/**/*.http.service.ts
- src/pages/result/**
- 실 API 응답 raw JSON 캡처

[작업]
1) login / signup / simulation create / status / overview / issues / ai-fix / heatmap / wcag 응답 raw JSON을 기준으로 현재 DTO 타입을 검증한다.
2) DTO와 실제 응답이 다르면 src/types/api 쪽을 먼저 수정한다.
3) adapter가 가정한 shape와 실제 응답이 다르면 src/adapters 쪽에서 흡수한다.
4) 페이지는 수정 범위를 최소화하고, 가능하면 view-model 계약은 유지한다.
5) WCAG가 page-level이면 result-wcag.adapter.ts의 pageContext 복제 로직을 제거한다.
6) Heatmap의 currentAgeGroup / pagination / errorPoints 구조가 다르면 adapter에서 우선 흡수한다.

[작업 원칙]
- 페이지는 raw 응답을 직접 모르도록 유지한다.
- 수정 범위는 가능하면 types/api, adapters, services로 제한한다.
- 실응답과 차이가 나는 지점을 문서화한다.

[완료 후 보고]
- 수정된 DTO / adapter / service 파일 목록
- 실제 응답과 기존 가정의 차이
- 페이지 수정이 필요했다면 그 이유
- 남은 리스크
```

### 프롬프트 B. 정책성 잔여 항목 정리

```text
너는 우리 프론트엔드의 백엔드 통합 마감 담당이다.
현재 핵심 기능 연결은 끝났고, 정책성 잔여 항목을 정리해서 통합 완료 판정이 가능하도록 만드는 것이 목표다.

[반드시 참고할 소스]
- src/adapters/simulation/simulation-create-request.adapter.ts
- src/constants/persona-device.ts
- src/types/api/common/enums.ts
- src/types/api/simulation/simulation-create.request.ts
- src/pages/result/ResultLayoutPage.tsx
- src/services/simulation/simulation.http.service.ts
- 관련 백엔드 API 명세

[작업]
1) persona device 6종과 BE 3종 사이의 매핑 정책을 정리한다.
2) endUrl을 FE-only로 유지할지, BE request DTO에 포함시킬지 결정안 두 가지를 비교한다.
3) simulation status enum을 전역적으로 통일할 기준을 제안한다.
4) 결과 페이지의 PDF 다운로드 / 공유하기 버튼을 유지, 숨김, placeholder 중 어떤 정책으로 갈지 제안한다.
5) 확정된 정책에 따라 FE 코드에서 최소 수정으로 반영 가능한 변경안을 정리한다.

[작업 원칙]
- 지금은 구조를 다시 뜯지 않는다.
- 정책이 확정되기 전까지는 수정 범위를 최소화한다.
- FE 단독으로 결정 가능한 것과 BE 협의가 필요한 것을 분리한다.

[완료 후 보고]
- 정책별 권장안
- BE 협의 필요 항목
- 실제 수정 대상 파일
- 통합 완료 판정 기준
```

### 프롬프트 C. 인증 운영 안정화

```text
너는 프론트 인증 운영 안정화 담당이다.
현재는 access token 저장과 Authorization 자동 주입, 401 logout까지는 구현되어 있다.
다음 목표는 refresh 정책과 다중 탭/만료 UX를 정리하는 것이다.

[반드시 참고할 소스]
- src/store/auth.store.ts
- src/services/core/http-client.ts
- src/services/auth/**
- src/pages/LoginPage.tsx
- 백엔드 인증 명세

[작업]
1) refresh token이 cookie 기반인지 body 기반인지 명세를 기준으로 정리한다.
2) 401 발생 시 자동 refresh 후 재시도할지, 즉시 logout할지 정책을 제안한다.
3) 다중 탭 로그인 상태 동기화가 필요한지 검토한다.
4) 현재 auth.store persist 버전과 마이그레이션 전략이 충분한지 점검한다.

[작업 원칙]
- 현재 로그인 UI 구조는 크게 바꾸지 않는다.
- http-client를 중심으로 최소 침습적으로 확장한다.

[완료 후 보고]
- 권장 refresh 정책
- 필요한 코드 변경 지점
- 보안/운영 리스크
```

## 8. 최종 판정

현재 프론트는 `백엔드 통합 시작 가능` 상태다.
다만 `백엔드 통합 완료`라고 부르려면 아래 둘 중 적어도 하나는 더 끝나야 한다.

1. 실 API raw 응답 기준 DTO / adapter 최종 검증
2. persona / endUrl / status / PDF / 공유 정책 확정

즉, 지금 단계는 "통합 직전"이라는 표현이 맞고, "완료"라고 부르기엔 약간 이르다.
