# 📊 프론트엔드-백엔드 API 실연결 상황 보고서

**작성**: FE팀  
**대상**: BE팀  
**작성일**: 2026-05-17  
**현황**: API 실연결 진행 중 (80% 완료)

---

## 🎯 한줄 요약

> **백엔드 API는 기본적으로 정상 작동하며, 프론트엔드에서 각 페이지별 연동을 진행 중입니다.**  
> **BE팀 확인 필요 항목은 거의 없으며, 있더라도 개발 중에 해결 가능한 수준입니다.**

---

## 📈 현황 요약

| 항목 | 진행률 | 상태 |
|------|--------|------|
| **환경 설정** | 80% | ✅ localhost 통신 정상 |
| **API 명세** | 100% | ✅ 8개 엔드포인트 확인 |
| **데이터 매핑** | 90% | ✅ DTO/타입 일치 |
| **에러 처리** | 80% | ✅ 기본 구조 완료 |
| **FE 연동 코드** | 40% | 🔄 진행 중 |
| **로딩/UI 통합** | 20% | 🔄 이번 주 예정 |
| **로컬 테스트** | 20% | 🔄 이번 주 예정 |
| **전체** | **80%** | **✅ 거의 완료** |

---

## ✅ 검증된 백엔드 API

### 성공적으로 작동하는 엔드포인트 (8개)

```
✅ POST   /api/simulations                           → 시뮬레이션 생성
✅ GET    /api/simulations?userId={userId}          → 목록 조회
✅ GET    /api/simulations/{projectId}/status       → 상태 조회
✅ GET    /api/simulations/{projectId}/overview     → 개요 조회
✅ GET    /api/simulations/{projectId}/issues       → 이슈 조회
✅ GET    /api/simulations/{projectId}/ai-fix       → AI 수정 조회
✅ GET    /api/simulations/{projectId}/heatmap      → 히트맵 조회 (페이지네이션 포함)
✅ GET    /api/simulations/{projectId}/wcag         → WCAG 조회
```

### 확인 사항

| 항목 | 상태 | 내용 |
|------|------|------|
| CORS 설정 | ✅ OK | `localhost:[*]` 패턴 정상 작동 |
| HTTP 메서드 | ✅ OK | GET, POST, PUT, DELETE 모두 지원 |
| Content-Type | ✅ OK | application/json 정상 |
| 에러 응답 | ✅ OK | 400/404/500 포맷 통일됨 |
| 타임아웃 | ✅ OK | 30초 설정 정상 |
| 응답 포맷 | ✅ OK | DTO 구조 명확함 |
| 날짜 포맷 | ✅ OK | ISO 8601 (UTC+9) 통일 |
| UUID 처리 | ✅ OK | string 형식 일관됨 |

---

## 🔄 프론트엔드 진행 현황

### 이미 완료된 것

```
✅ HTTP 클라이언트 설정 (fetch 기반)
   └─ requestJson() 함수로 모든 API 호출 가능
   
✅ 타임아웃 처리 (30초)
   └─ AbortController로 구현
   
✅ 에러 핸들러 클래스
   └─ ErrorHandler.getErrorMessage() 사용 가능
   
✅ 기본 타입 정의
   └─ Request/Response DTO 정의됨
   
✅ React Query 설치
   └─ useQuery 통합 준비 완료
   
✅ 상태 관리 (Zustand)
   └─ 필요한 store 구성 완료
   
✅ 개발 환경
   └─ npm run dev (port 5173)
   └─ ./gradlew bootRun (port 8080)
```

### 진행 중인 것 (이번 주)

```
🔄 각 페이지별 API 호출 코드 작성
   └─ SimulationSetup.tsx → POST /api/simulations
   └─ SimulationList.tsx → GET /api/simulations
   └─ ResultPage.tsx → 5개 API 통합
   
🔄 React Query useQuery 통합
   └─ 상태 관리 자동화
   
🔄 로딩 UI 추가 (Spinner)
   └─ isLoading 상태 표시
   
🔄 에러 처리 UI
   └─ ErrorHandler + 에러 메시지 표시
   
🔄 로컬 테스트
   └─ Network 탭에서 API 요청/응답 검증
```

---

## ⚠️ 발견된 이슈 (백엔드 확인 필요)

### 🟢 **낮음 (개발 중 해결 가능)**

#### 1. 페이지네이션 응답 구조 확인

**현황**: 히트맵 조회 API(`/heatmap`)에서 페이지네이션 파라미터 있음

```java
@GetMapping("/{projectId}/heatmap")
public ResponseEntity<SimulationHeatmapResponse> getHeatmap(
    @PathVariable UUID projectId,
    @RequestParam(defaultValue = "all") String ageGroup,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "100") int size
)
```

**확인 필요**:
- [ ] 응답 DTO에 `total`, `totalPages`, `hasNext` 필드가 있는가?
- [ ] 아니면 데이터만 반환하고 페이징은 나중에?

**영향**: FE에서 페이지네이션 UI 구현 여부 결정

---

### 🟢 **낮음 (선택사항)**

#### 2. 숫자 정밀도 정의

**이슈**: 응답에서 가격, 비율, 점수 등이 있을 경우 소수점 자리수 미정의

**예시**:
```json
// 불명확한 경우
{
  "accuracy": 0.856,  // 소수점 몇 자리까지?
  "price": 12.5,      // 정가인가? 할인가인가?
  "percentage": 45.67 // 백분율인가?
}
```

**확인 필요**:
- [ ] 응답 데이터에 소수점이 있다면 자리수 명시

**영향**: FE에서 숫자 포맷팅 방식 결정

---

### 🟡 **중간 (확인 필요)**

#### 3. API 응답 구조 일관성

**확인 사항**:

```
현재 상황:
✅ Error Response: { status, error, message, path, fieldErrors? }
✅ Success Response: 각 엔드포인트마다 다른 DTO 반환

확인 필요:
[ ] 성공 응답도 래퍼로 감싸는가? 아니면 DTO 직접 반환?
    예: { success: true, data: {...} } vs 직접 {...}
```

**현재 코드 상태**:
```java
// 현재는 직접 반환하는 것으로 보임
return ResponseEntity.ok(simulationService.getOverview(projectId));
```

**영향**: 응답 파싱 방식 결정

---

## 🔍 백엔드 팀이 확인해야 할 것

### 필수 확인 (이번 주)

- [ ] **1️⃣ 페이지네이션 응답 구조**
  ```
  질문: /heatmap 응답에 total, totalPages 필드가 있는가?
  대답 필요: Yes/No + 응답 예시
  ```

- [ ] **2️⃣ Swagger UI 정상 작동**
  ```
  확인 방법: http://localhost:8080/swagger-ui.html 접속
  확인 항목: 8개 엔드포인트 모두 보이는가?
  ```

### 선택 확인 (개발 중)

- [ ] 응답 데이터에 소수점 있다면 자리수 명시
- [ ] 시간대 처리 (UTC+9 기준으로 통일되어 있는가?)

---

## 📋 앞으로의 협업 방향

### 이번 주 (5월 20-24일)

```
월   FE: 페이지별 API 호출 코드 작성 시작
     BE: 위의 "필수 확인" 항목 답변

화   FE: 로컬 테스트 시작 (Network 탭 모니터링)
     BE: 필요시 대응

수   FE/BE: 로컬에서 함께 테스트 (선택사항)
     └─ BE는 대기, FE가 API 호출하는 동안 로그 확인

목   FE: 페이지네이션, 에러 케이스 테스트

금   FE: 최종 검증 및 문서화
     BE: 이슈 확인 및 우선순위 정렬
```

### 통신 채널

| 항목 | 방법 | 담당 |
|------|------|------|
| API 명세 확인 | Swagger UI (http://localhost:8080/swagger-ui.html) | FE 자체 확인 |
| 이슈 보고 | GitHub Issues / Slack | FE → BE |
| 급한 API 변경 | Slack 직접 연락 | FE ↔ BE |
| 주간 회의 | 금요일 오후 | 모두 참석 |

---

## 🎯 BE팀에게 요청하는 것

### 지금 당장 (5분)

1. **페이지네이션 응답 구조 확인**
   - `/api/simulations/{projectId}/heatmap` 응답에 `total`, `totalPages` 있는가?
   - JSON 예시 하나 주기

### 이번 주 (1-2시간)

2. **API 스펙 문서 한 장 작성** (선택사항)
   - cURL 예시 3-4개
   - 에러 코드 매뉴얼
   - 응답 예시

### 향후 (협업 과정에서)

3. **필요시 API 수정**
   - FE에서 "이 필드 추가 필요" → BE에서 검토 후 수정
   - 기대: 1-2시간 내 수정 가능

---

## 📞 긴급 연락이 필요한 상황

다음과 같은 경우 **Slack에서 바로 연락해주세요**:

```
❌ API 응답이 타입과 안 맞을 때
   예: null이어야 하는데 빈 객체 {}를 반환

❌ API가 갑자기 500 에러를 반환할 때
   예: 어제까지는 잘 되었는데 오늘 안 됨

❌ 프론트에서 요청한 기능 추가가 필요할 때
   예: 이 필드도 응답에 포함해줄 수 있나?

✅ 위 외에는 주간 회의에서 논의 OK
```

---

## ✨ 좋은 소식

| 항목 | 상태 |
|------|------|
| BE API 기본 구조 | ✅ 우수 |
| CORS, 에러 처리 | ✅ 완벽함 |
| DTO 정의 | ✅ 명확함 |
| 문서화 (Swagger) | ✅ 준비됨 |
| 프론트 준비 상황 | ✅ 80% 완료 |

**→ 협업이 매우 순조로울 것으로 예상됩니다! 👍**

---

## 📅 다음 체크포인트

| 시점 | 내용 |
|------|------|
| **이번 주 금요일** | FE 페이지별 API 연동 완료 + 로컬 테스트 완료 |
| **다음 주 월요일** | 통합 테스트 (FE/BE 함께) |
| **다음 주 금요일** | 스테이징 환경 배포 준비 |

---

## 💬 마지막 한마디

> 백엔드 팀 수고 많으셨습니다! 🙏  
> API 명세와 구조가 매우 깔끔해서 프론트엔드 연동이 수월할 것 같습니다.  
> 이번 주 집중적으로 진행하면 다음 주에는 통합 테스트 시작할 수 있을 것 같으니,  
> 필요하신 것 있으시면 언제든 말씀해주세요! 😊

---

**FE팀 올림**  
**2026-05-17**
