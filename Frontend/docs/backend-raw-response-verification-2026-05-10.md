# 백엔드 실응답 대조 점검 메모

작성일: 2026-05-10
대상 브랜치: `codex/fe-jihyun-latest`
목적: 실제 백엔드 raw 응답과 현재 FE DTO / adapter / service 가정을 대조하기 위한 기준 정리

## 결론

현재 워크스페이스에는 `login / signup / simulation create / status / overview / issues / ai-fix / heatmap / wcag`에 대한
실 API raw JSON 캡처 파일이 없다.

따라서 이번 점검에서는 다음까지만 확정할 수 있다.

- 현재 DTO / adapter / service가 어떤 응답 shape를 가정하는지
- 어떤 엔드포인트는 그대로 붙을 가능성이 높은지
- 어떤 엔드포인트는 raw 응답 없이는 최종 확정할 수 없는지

즉, 이번 단계는 `실응답 검증 준비 완료`까지이며, `실응답 기준 최종 보정 완료`는 아니다.

## 엔드포인트별 현재 가정

| 영역 | 현재 FE 가정 | 현재 판정 |
|---|---|---|
| login | `accessToken`, optional `tokenType`, optional `expiresIn`, optional `refreshToken`, `user` | raw 없음, 가정 유지 |
| signup | login 응답과 동일하거나 매우 유사 | raw 없음, 가정 유지 |
| simulation create | `id`, `title`, `status`, `createdAt` | raw 없음, 가정 유지 |
| simulation status | `status`, optional `progress`, optional `currentStepIndex`, optional `message` | raw 없음, 가정 유지 |
| overview | `summary`, `funnelPanels[]` | raw 없음, 가정 유지 |
| issues | `pages[] -> issues[]` | raw 없음, 가정 유지 |
| ai-fix | `pages[] -> fixes[]` | raw 없음, 가정 유지 |
| heatmap | `pages[]`, each page has `currentAgeGroup`, `errorPoints[]`, `pagination` | raw 없음, 일부 방어로직 있음 |
| wcag | simulation-level `summary`, `distribution`, `issues[]` | raw 없음, 정책 미확정 |

## 현재 코드 기준 점검 결과

### 1. login / signup

참고 파일:
- [auth-login.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/auth/auth-login.response.ts)
- [auth-signup.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/auth/auth-signup.response.ts)
- [auth.http.service.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/services/auth/auth.http.service.ts)

현재 FE 가정:
- 로그인은 `accessToken` 중심 응답
- `refreshToken`은 optional
- 사용자 프로필은 `user` 객체에서 온다
- 회원가입은 로그인 응답과 동일한 shape를 기본 가정한다

확정 필요:
- signup 직후 token을 바로 주는지
- refresh token이 cookie 기반인지 body 기반인지
- `user` 필드 안의 실제 키 이름이 `id/displayName/initials/username`과 일치하는지

### 2. simulation create / status

참고 파일:
- [simulation-create.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/simulation/simulation-create.response.ts)
- [simulation-status.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/simulation/simulation-status.response.ts)
- [simulation.http.service.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/services/simulation/simulation.http.service.ts)

현재 FE 가정:
- 생성 응답은 최소 `id`, `title`, `status`, `createdAt`
- 상태 조회는 문자열 status와 optional 진행도 필드를 준다
- FE는 status 문자열을 `pending/running/completed/failed`로 정규화한다

확정 필요:
- 생성 응답에 `title`이 실제로 포함되는지
- status 응답에 `progress`와 `currentStepIndex`가 항상 오는지
- 실패 status 시 `message`가 항상 오는지
- status 원본 enum이 `success/error/cancelled` 같은 다른 값도 포함하는지

### 3. overview

참고 파일:
- [simulation-overview.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/simulation/simulation-overview.response.ts)
- [result-overview.http.service.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/services/result/result-overview.http.service.ts)

현재 FE 가정:
- 상단 summary와 funnel panel 배열 구조
- panel마다 age band별 entered/passed/dropOff/successRate 제공

확정 필요:
- age band 키가 `"10대"` 같은 한글 문자열인지, 영문 enum인지
- seconds 단위 숫자 필드 이름이 현재 가정과 일치하는지

### 4. issues

참고 파일:
- [simulation-issues.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/simulation/simulation-issues.response.ts)
- [result-issues.http.service.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/services/result/result-issues.http.service.ts)

현재 FE 가정:
- 페이지 배열 기반 응답
- 각 페이지에 screenshot과 issue 목록이 들어 있다
- severity는 공통 enum adapter에서 흡수한다

확정 필요:
- `targetHtml`, `tags`가 실제로 오는지
- screenshot URL 필드 이름이 동일한지

### 5. ai-fix

참고 파일:
- [simulation-ai-fix.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/simulation/simulation-ai-fix.response.ts)
- [result-ai-fix.http.service.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/services/result/result-ai-fix.http.service.ts)

현재 FE 가정:
- 페이지 배열 기반 응답
- 각 페이지에 fix 목록이 있고 `beforeCode`, `afterCode`, `impactDescription`, `changeDescription`을 포함한다

확정 필요:
- 코드 diff가 문자열인지, 블록 배열인지
- 영향 설명 / 변경 설명 필드 이름이 동일한지

### 6. heatmap

참고 파일:
- [simulation-heatmap.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/simulation/simulation-heatmap.response.ts)
- [result-heatmap.adapter.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/adapters/result/result-heatmap.adapter.ts)
- [result-heatmap.http.service.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/services/result/result-heatmap.http.service.ts)

현재 FE 가정:
- 응답은 `pages[]`
- 각 page는 `currentAgeGroup`, `errorPoints[]`, `pagination`
- 각 좌표는 `0~1` 또는 `0~100` 둘 다 들어올 수 있다고 보고 adapter에서 정규화

이미 반영된 방어:
- 좌표 스케일 차이는 adapter에서 흡수 가능

확정 필요:
- `currentAgeGroup` 표현값이 현재 enum 가정과 일치하는지
- `pagination`이 page 단위인지 전체 단위인지
- `errorBreakdown` 구조가 timeout/network/console 3축이 맞는지

### 7. wcag

참고 파일:
- [simulation-wcag.response.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/types/api/simulation/simulation-wcag.response.ts)
- [result-wcag.adapter.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/adapters/result/result-wcag.adapter.ts)
- [result-wcag.http.service.ts](/C:/Users/skyko/Desktop/SWARM/FE/Frontend/src/services/result/result-wcag.http.service.ts)

현재 FE 가정:
- 응답은 simulation-level `summary`, `distribution`, `issues[]`
- 페이지별 컨텍스트가 없으면 FE가 "전체 페이지" 카드 1개를 만든다

가장 큰 미확정 지점:
- 실제 백엔드가 page-level WCAG를 내려주면 현재 adapter 정책을 바꿔야 한다

즉시 수정 필요 조건:
- raw JSON에 `pages[]`가 있으면 DTO부터 page-level 구조로 수정
- 그 경우 `pageContext` 복제 로직은 제거

## 이번 점검에서 코드 변경을 하지 않은 이유

실 raw 응답 없이 DTO를 선제 수정하면 오히려 현재 서비스/adapter 계약을 흔들 가능성이 있다.
특히 아래 두 지점은 raw 없이 바꾸는 것이 위험하다.

1. WCAG의 simulation-level vs page-level 구조
2. heatmap의 ageGroup / pagination / errorPoint 세부 필드

따라서 현재는 `가정 유지 + 확정 필요 지점 문서화`가 최선이다.

## 다음에 raw JSON이 들어오면 바로 볼 파일

우선순위 순서:

1. `src/types/api/auth/**`
2. `src/types/api/simulation/**`
3. `src/adapters/result/result-wcag.adapter.ts`
4. `src/adapters/result/result-heatmap.adapter.ts`
5. `src/services/**/*.http.service.ts`

## 남은 리스크

1. signup 응답이 login과 다르면 auth DTO와 mutation 분기가 필요하다.
2. status 응답 enum이 현재 정규화 가정보다 넓으면 header/sidebar/status UI 정책까지 같이 손봐야 한다.
3. WCAG가 page-level 응답이면 adapter뿐 아니라 view-model도 일부 수정될 수 있다.
4. heatmap pagination 정책이 다르면 페이지 컴포넌트의 이동 UX도 재검토가 필요할 수 있다.
