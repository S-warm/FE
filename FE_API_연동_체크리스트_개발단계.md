# ✅ FE API 연동 체크리스트 (개발 단계)

**대상**: 프론트엔드 개발자가 해야할 것들  
**기준**: 백엔드 API와 실제로 연동 가능한가?  
**분석 날짜**: 2026-05-17  
**전체 진행률**: `[▓▓▓▓▓▓▓▓░░] 32/40 (80%)` 

---

## 1️⃣ 개발 환경 준비 (프론트엔드)

**진행률**: `[▓▓▓▓▓▓▓▓░░] 8/10 (80%)`

| # | 상태 | 항목 | 현황 | FE 할 것 |
|---|------|------|------|----------|
| 1-1 | `[✔]` | .env 파일 설정 | ✅ `.env.local`: `VITE_API_BASE_URL=http://localhost:8080` 완료 | 완료 ✔ |
| 1-2 | `[✔]` | 로컬 포트 설정 | ✅ Vite 기본 포트 5173 사용 | 완료 ✔ |
| 1-3 | `[✔]` | 타임아웃 설정 | ✅ 30초 설정 | 완료 ✔ |
| 1-4 | `[✔]` | HTTP 클라이언트 설정 | ✅ `http-client.ts` 구성 완료 | 완료 ✔ |
| 1-5 | `[✔]` | GET/POST/PUT/DELETE 처리 | ✅ 모두 지원 | 완료 ✔ |
| 1-6 | `[✔]` | Content-Type 자동 설정 | ✅ application/json 자동 추가 | 완료 ✔ |
| 1-7 | `[✔]` | 에러 핸들러 준비 | ✅ ErrorHandler 클래스 준비 | 완료 ✔ |
| 1-8 | `[✔]` | 상태 관리 (Zustand) | ✅ auth.store.ts 준비 | 완료 ✔ |
| 1-9 | `[▶]` | package.json 확인 | ⚠️ React Query, 상태관리 설치됨. 필요한 라이브러리 추가 여부 확인 필요 | 필요시 추가 |
| 1-10 | `[✔]` | npm install 완료 | ✅ 모든 의존성 설치 가능 | 완료 ✔ |

**FE 상태**: ✅ **개발 환경 준비 완료. 바로 개발 시작 가능**

---

## 2️⃣ API 호출 코드 구현

**진행률**: `[▓▓▓▓░░░░░░] 4/10 (40%)`

### 각 기능별 API 호출 상태

| # | 기능 | 상태 | 상세 | 할 일 |
|---|------|------|------|-------|
| 2-1 | 시뮬레이션 생성 | `[▶]` | 요청/응답 타입 정의됨, API 호출 코드 미확인 | 페이지에서 실제 호출 구현 |
| 2-2 | 시뮬레이션 목록 조회 | `[ ]` | 타입만 정의됨 | API 호출 코드 + UI 표시 |
| 2-3 | 상태 조회 | `[ ]` | 폴링 필요할 수 있음 | 주기적 폴링 로직 구현 |
| 2-4 | 개요(Overview) 조회 | `[ ]` | 데이터 매핑 필요 | 차트/데이터 표시 |
| 2-5 | 이슈 조회 | `[ ]` | 필터/정렬 필요 | API 파라미터 + UI |
| 2-6 | AI 수정 조회 | `[ ]` | 데이터 형식 확인 필요 | 마크다운/HTML 렌더링 |
| 2-7 | 히트맵 조회 | `[ ]` | 페이지네이션 있음 | 차트 + 페이징 UI |
| 2-8 | WCAG 조회 | `[ ]` | 복잡한 데이터 구조 | 재귀적 렌더링 |
| 2-9 | 에러 처리 | `[▶]` | ErrorHandler 클래스 있음 | 각 호출마다 try-catch 적용 |
| 2-10 | 재시도 로직 | `[✔]` | `requestJsonWithFallback` 함수 있음 | 필요시 사용 ✔ |

**FE 할 일**:
```
[ ] SimulationSetup.tsx → POST /api/simulations 호출 구현
[ ] SimulationList.tsx → GET /api/simulations 호출 + 목록 표시
[ ] ResultPage.tsx → GET /api/simulations/{id}/overview 등 5개 API 호출
[ ] 각 호출마다 try-catch로 에러 처리
[ ] 로딩 상태 UI 표시
```

---

## 3️⃣ 로딩 상태 UI

**진행률**: `[▓▓░░░░░░░░] 2/10 (20%)`

| # | 상태 | 항목 | 현황 | FE 할 것 |
|---|------|------|------|----------|
| 3-1 | `[ ]` | React Query `useQuery` 통합 | ⚠️ 패키지는 있으나 구체적 사용 미확인 | 각 페이지에서 `useQuery` 사용 |
| 3-2 | `[▶]` | Spinner/Skeleton 컴포넌트 | 있는 것 같으나 위치 불명확 | `src/components` 에서 찾아 사용 |
| 3-3 | `[ ]` | API 로딩 중 UI 표시 | ❌ 구현 안 됨 | isLoading 상태 체크 후 Spinner 표시 |
| 3-4 | `[ ]` | 데이터 로딩 완료 UI | ❌ 구현 안 됨 | 데이터 표시 |
| 3-5 | `[ ]` | 로딩 실패 UI | `[▶]` ErrorHandler는 있으나 UI 없음 | 에러 메시지 표시 |
| 3-6 | `[ ]` | 재시도 버튼 | ❌ 구현 안 됨 | 에러 시 재시도 버튼 추가 |
| 3-7 | `[ ]` | 로딩 취소 | ❌ 구현 안 됨 | AbortController로 취소 기능 (선택사항) |
| 3-8 | `[ ]` | 스켈레톤 로더 | 컴포넌트는 있을 수 있음 | 데이터 로딩 중 skeleton 표시 |
| 3-9 | `[▶]` | 폴백 데이터 | `dev-fallback-json.ts` 있음 | 필요시 활용 |
| 3-10 | `[ ]` | 무한 로딩 방지 | ⚠️ 타임아웃은 있으나 UI 표시 안 함 | 30초 후 에러 메시지 표시 |

**FE 할 일** (가장 중요):
```typescript
// 예시: SimulationList.tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['simulations', userId],
  queryFn: () => requestJson(`/api/simulations?userId=${userId}`),
})

if (isLoading) return <Spinner />  // ← 이 부분 구현 필요
if (error) return <ErrorState error={error} />  // ← 이 부분 구현 필요
return <SimulationListView data={data} />
```

---

## 4️⃣ 에러 처리 UI

**진행률**: `[▓▓▓▓░░░░░░] 4/10 (40%)`

| # | 상태 | 항목 | 현황 | FE 할 것 |
|---|------|------|------|----------|
| 4-1 | `[✔]` | ErrorHandler 클래스 | ✅ 준비됨 | 사용만 하면 됨 |
| 4-2 | `[✔]` | 타임아웃 메시지 | ✅ "30초 이상 걸렸습니다" | 에러 UI에 표시 |
| 4-3 | `[✔]` | 네트워크 에러 메시지 | ✅ "네트워크 연결을 확인해주세요" | 에러 UI에 표시 |
| 4-4 | `[✔]` | 서버 에러 메시지 | ✅ "서버 오류가 발생했습니다" | 에러 UI에 표시 |
| 4-5 | `[▶]` | 에러 상태 컴포넌트 | 있는 것 같음 (`error-state.tsx`) | 어디에 있는지 확인 후 사용 |
| 4-6 | `[ ]` | Toast 메시지 | ❌ 구현 안 됨 | 간단한 에러는 Toast로 표시 |
| 4-7 | `[ ]` | Modal 에러 표시 | ❌ 구현 안 됨 | 중요한 에러는 Modal로 표시 |
| 4-8 | `[ ]` | 필드 에러 표시 | ⚠️ 폼 검증은 있을텐데 API 에러와 통합 필요 | 400 Bad Request 시 필드별 에러 표시 |
| 4-9 | `[ ]` | 재시도 버튼 | ❌ 구현 안 됨 | 에러 UI에 재시도 버튼 추가 |
| 4-10 | `[ ]` | 에러 로깅 | ⚠️ ErrorHandler에 TODO | console.log나 간단한 로깅 |

**FE 할 일**:
```typescript
// 예시: API 호출 시 에러 처리
try {
  const result = await requestJson(`/api/simulations/${id}/overview`)
  setData(result)
} catch (error) {
  const message = ErrorHandler.getErrorMessage(error, '데이터를 불러올 수 없습니다')
  setError(message)
  // ← Toast 또는 ErrorState 컴포넌트로 표시
}
```

---

## 5️⃣ 데이터 타입 & 포맷 처리

**진행률**: `[▓▓▓▓▓▓▓░░░] 7/10 (70%)`

| # | 상태 | 항목 | 현황 | FE 할 것 |
|---|------|------|------|----------|
| 5-1 | `[✔]` | UUID 처리 | ✅ string 타입으로 받음 | 그대로 사용 가능 |
| 5-2 | `[✔]` | 날짜 포맷 (ISO 8601) | ✅ `2026-04-11T10:30:45+09:00` | `new Date(dateString)` 또는 라이브러리 사용 |
| 5-3 | `[ ]` | 시간대 처리 | ⚠️ 백엔드는 Asia/Seoul | 표시 시 로컬 시간대 변환 필요 여부 확인 |
| 5-4 | `[✔]` | boolean 타입 | ✅ true/false | 그대로 사용 |
| 5-5 | `[✔]` | 정수/실수 구분 | ✅ 명확함 | 타입 정의만 정확히 |
| 5-6 | `[▶]` | null/undefined 처리 | ⚠️ 응답에서 null일 수 있는 필드 명확히 | 타입 정의 시 `?` 또는 `| null` 표기 |
| 5-7 | `[✔]` | 배열 응답 | ✅ List → array 변환 | 그대로 사용 |
| 5-8 | `[▶]` | 페이지네이션 필드 | ⚠️ total, totalPages 확인 필요 | 백엔드 응답 구조 확인 후 타입 정의 |
| 5-9 | `[ ]` | 가격/금액 포맷 | ❌ 소수점 자리수 미정의 | 필요시 소수점 처리 |
| 5-10 | `[✔]` | 날짜 표시 포맷 | UI에서 사용자 친화적으로 표시 | `dd.format('YYYY-MM-DD')` 또는 라이브러리 |

**FE 할 일**:
```typescript
// 타입 정의 예시
interface SimulationResponse {
  projectId: string  // UUID
  title: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string  // ISO 8601
  description?: string  // optional
}

// 백엔드 응답 확인 필요
interface SimulationListResponse {
  data: SimulationResponse[]
  total: number  // ← 이 필드가 있는지 확인
  totalPages: number  // ← 이 필드가 있는지 확인
  page: number
}
```

---

## 6️⃣ 실제 개발 테스트

**진행률**: `[▓▓░░░░░░░░] 2/10 (20%)`

| # | 상태 | 항목 | 현황 | FE 할 것 |
|---|------|------|------|----------|
| 6-1 | `[✔]` | FE 로컬 서버 실행 | ✅ `npm run dev` 가능 | 완료 ✔ |
| 6-2 | `[✔]` | BE 로컬 서버 실행 | ✅ `./gradlew bootRun` 가능 | 완료 ✔ |
| 6-3 | `[ ]` | 브라우저에서 FE 열기 | ❌ 아직 테스트 안 함 | http://localhost:5173 열고 확인 |
| 6-4 | `[ ]` | 로그인/시작 페이지 작동 | ❌ 아직 구현 안 함 | 페이지 네비게이션 확인 |
| 6-5 | `[ ]` | 시뮬레이션 생성 API 테스트 | ❌ 아직 테스트 안 함 | 입력 후 실제 API 호출 확인 (Network 탭) |
| 6-6 | `[ ]` | 시뮬레이션 목록 조회 테스트 | ❌ 아직 테스트 안 함 | 목록 표시 확인 |
| 6-7 | `[ ]` | 에러 처리 테스트 | ❌ 아직 테스트 안 함 | BE 끄고 에러 메시지 표시 확인 |
| 6-8 | `[ ]` | 타임아웃 테스트 | ❌ 아직 테스트 안 함 | 느린 네트워크 시뮬레이션 후 확인 |
| 6-9 | `[ ]` | 로딩 상태 UI 확인 | ❌ 아직 확인 안 함 | 로딩 중 UI 표시 확인 |
| 6-10 | `[ ]` | 데이터 정합성 확인 | ❌ 아직 확인 안 함 | 콘솔에서 받은 데이터 구조 확인 |

**FE 할 일** (개발 체크리스트):
```
[ ] npm run dev로 FE 서버 시작
[ ] 브라우저 DevTools → Network 탭 열기
[ ] 각 기능별로 API 호출 확인 (Status 200, Response 구조 확인)
[ ] 에러 케이스 테스트 (BE 끄고, 잘못된 userId 등)
[ ] 로딩 상태 UI 표시되는지 확인
[ ] 에러 메시지 표시되는지 확인
[ ] 받은 데이터가 타입과 일치하는지 console.log로 확인
```

---

## 📋 FE가 지금 바로 해야할 것 (우선순위)

### 🔴 **오늘/내일 (필수)**

```
[ ] 1️⃣ 각 API 호출 코드 작성 (SimulationCreate, SimulationList, Overview 등)
      └─ requestJson() 함수 사용하면 됨
      
[ ] 2️⃣ React Query useQuery 통합
      └─ src/queries 폴더에서 hook 만들기
      
[ ] 3️⃣ 로딩 UI 추가 (isLoading 체크 후 Spinner 표시)
      └─ if (isLoading) return <Spinner />
      
[ ] 4️⃣ 에러 처리 UI 추가 (ErrorHandler 사용)
      └─ try-catch로 감싸고 에러 메시지 표시
```

### 🟡 **이번 주 (중요)**

```
[ ] 5️⃣ 각 페이지에서 실제 테스트 (FE/BE 함께 실행)
      └─ Network 탭에서 API 요청/응답 확인
      
[ ] 6️⃣ 타입 정의 확인 (응답 데이터가 타입과 일치하는가?)
      └─ console.log로 받은 데이터 구조 확인
      
[ ] 7️⃣ 에러 케이스 테스트 (BE 끄고 테스트, 잘못된 ID 등)
      └─ 에러 메시지 제대로 표시되는지 확인
      
[ ] 8️⃣ 페이지네이션 필드 확인 (total, totalPages 있는지)
      └─ 백엔드와 확인 후 타입 정의 수정
```

### 🟢 **향후 (선택사항)**

```
[ ] Toast 메시지 라이브러리 추가 (react-hot-toast 등)
[ ] 재시도 버튼 UI 추가
[ ] 무한 로딩 방지 (30초 후 에러 표시)
[ ] 시간대 변환 (필요시)
```

---

## ✅ 최종 체크리스트

FE 개발자가 API 연동 완료 판단 기준:

```
환경 설정
[ ] npm install 완료 ✔
[ ] .env.local 설정 ✔
[ ] npm run dev 실행 가능 ✔

API 호출 코드
[ ] 시뮬레이션 생성 API 구현
[ ] 시뮬레이션 목록 조회 API 구현
[ ] 상세 조회 API (overview, issues, ai-fix, heatmap, wcag) 구현
[ ] 각 API별 RequestBody/Response 타입 정의

로딩 & 에러 처리
[ ] useQuery로 상태 관리
[ ] isLoading true일 때 Spinner 표시
[ ] error 발생 시 ErrorHandler로 메시지 추출 후 표시
[ ] 각 API 호출마다 try-catch 또는 useQuery의 onError 처리

테스트
[ ] 로컬에서 FE/BE 함께 실행 후 API 호출 확인 (Network 탭)
[ ] 에러 케이스 테스트 (BE 끔, 잘못된 ID 등)
[ ] 로딩 상태 UI 표시 확인
[ ] 받은 데이터 구조 console.log로 확인

타입/데이터
[ ] 응답 데이터 타입 정의 완료
[ ] UUID, 날짜, boolean 등 포맷 확인
[ ] null/undefined 필드 `?` 표기
[ ] 페이지네이션 응답 구조 확인
```

---

## 🎯 최종 판정

| 항목 | 상태 | 비고 |
|------|------|------|
| **개발 환경** | ✅ 준비 완료 | 바로 개발 시작 가능 |
| **HTTP 클라이언트** | ✅ 완료 | requestJson() 사용 |
| **타입 정의** | ⚠️ 부분 완료 | 응답 데이터 타입 확인 후 정의 필요 |
| **API 호출 코드** | ❌ 미작성 | 각 페이지에서 구현 필요 |
| **로딩 UI** | ❌ 미통합 | useQuery + Spinner 추가 필요 |
| **에러 UI** | ⚠️ 부분 완료 | ErrorHandler는 있으나 UI 통합 필요 |
| **테스트** | ❌ 미수행 | 로컬 개발 중 진행 |

### 🚀 **결론: FE 개발자가 지금 시작할 수 있는 상태 ✅**

> **지금 상태**  
> ✅ 기본 인프라 완료 (HTTP 클라이언트, 에러 핸들러)  
> ✅ 타입 정의 기반 준비됨  
> ✅ BE API 스펙 확인 가능 (Swagger: http://localhost:8080/swagger-ui.html)  
>
> **해야할 것**  
> ⚠️ 각 페이지에서 API 호출 코드 작성 (2-3일)  
> ⚠️ 로딩/에러 UI 통합 (1-2일)  
> ⚠️ 로컬 테스트 및 타입 검증 (1-2일)  
>
> **예상 완료**: 1주일 내 API 연동 완료 가능 🎯

---

**다음 체크포인트**: 1주일 후 로컬 테스트 결과 리뷰
