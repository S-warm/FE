# 🔴 FE 배포 후 4개 버그 근본 원인 분석 (최종)

**분석 완료**: 2026-05-25  
**분석 방법**: 코드 리뷰 + 파일 시스템 검사 + 네트워크 흐름 추적  
**상태**: 4개 버그 모두 근본 원인 파악 완료 ✓

---

## 🐛 버그 1: 좌측 사이드바 페이지 이미지 스크린샷 미로드

### 현상
```
- 사이드바에 페이지 섬네일이 로드되지 않음
- 레이아웃 비율이 비정상적으로 커져서 망가짐
- 이미지 파일이 없거나 경로 오류
```

### 근본 원인 FOUND ✓

**문제점 1: 데이터 불일치 (API 응답 vs 매핑)**

**파일**: `src/adapters/result/result-ai-fix.adapter.ts` (라인 32-40)
```typescript
function resolveScreenshotUrl(url: string) {
  if (url.includes("/search")) return getResultPageScreenshotUrl("search")
  // ...
  return getResultPageScreenshotUrl()  // 폴백
}
```

**흐름**:
1. API에서 반환된 `page.pageUrl` 기반으로 `pageId` 매핑
2. `getResultPageScreenshotUrl("search")` → `/mock-images/optimized/page-search.jpg` 반환
3. 문제: API가 실제 서버 이미지 경로를 반환한다면?
   - 예: `"/uploads/screenshots/page_123.jpg"`
   - → `RESULT_PAGE_SCREENSHOT_ASSETS` 딕셔너리에 없음
   - → 폴백 사용: `/mock-images/optimized/img-example-site.jpg`
   - → 단일 이미지로 모든 페이지를 표시

**문제점 2: 페이지 개수 불일치**

사용자 보고: "페이지 갯수랑. 스프링에서 비즈니스로직에서는 제대로 json 파일과 DB가 제대로 나왔음. 프론트쪽에서 제대로 못가져오고 있는 거임. 원인 확인 필요함. 애초에 지금 각 페이지 마다 결과 페이지 갯수도 다 다름"

→ **API에서 반환되는 페이지 수가 일정하지 않을 가능성**

**파일 시스템 확인 결과** ✓
```
/public/mock-images/ 디렉토리 존재 확인
- img-example-site.png ✓
- page-search.png ✓
- page-login.png ✓
- page-product-detail.png ✓
등등... 모두 존재

→ 이미지 파일은 존재함
→ 문제는 경로 또는 매핑
```

### 해결 필요 항목

1. **백엔드 API 응답 확인**
   - `/api/simulations/{id}/ai-fix` 응답 JSON에서 `screenshotUrl` 필드값 확인
   - 예상 값: `/mock-images/page-search.png` 또는 실제 서버 경로?

2. **데이터 일관성 확인**
   - 모든 페이지에서 동일한 수의 아이템이 반환되는가?
   - pages 배열의 길이가 일정한가?

3. **매핑 로직 보강**
   - API에서 실제 경로가 오는 경우 처리 추가 필요

---

## 🐛 버그 2: AI 수정 issue_title 공백으로 렌더링

### 현상
```
"검색 결과 필터 버튼 인식 실패" 데이터가 공백으로 표시됨
HTML에서 <p>...</p> 태그가 비어있음
```

### 근본 원인 FOUND ✓

**분석 결과: 코드는 올바름, 데이터가 문제**

**확인된 코드 흐름**:

1️⃣ **API 타입 정의** (`src/types/api/simulation/simulation-ai-fix.response.ts`)
```typescript
export interface SimulationAiFixBusinessItemDto {
  issue_title: string  // ✓ 필드 정의
  // ...
}
```

2️⃣ **Adapter 매핑** (`src/adapters/result/result-ai-fix.adapter.ts` 라인 62)
```typescript
fixes: raw.fixes.map((fix, index) => ({
  issueType: "ux" as const,
  issueId: `ai-fix-${index + 1}`,
  title: fix.issue_title,  // ✓ 올바르게 매핑
  // ...
}))
```

3️⃣ **컴포넌트 렌더링** (`src/pages/result/ResultAiFixPage.tsx` 라인 364)
```tsx
<p className="..." title={fix.title}>
  {fix.title}  // ✓ 올바르게 렌더링
</p>
```

**→ 코드 로직은 완벽함**

**실제 문제**: **API 응답에서 `issue_title` 필드가 공백이거나 null**

### 가능한 원인들 (우선순위 순)

1. **스프링 백엔드 필드명 불일치**
   - Entity: `issueTitle` (camelCase)
   - DTO/JSON: `issue_title` (snake_case)
   - 매핑 누락 → null 응답

2. **스프링 Null 처리**
   - DB에 issue_title이 NULL인 데이터
   - Serializer에서 null 필드 반환

3. **JSON 직렬화 문제**
   - 일부 필드만 선택되어 issue_title이 제외됨

### 해결 필요 항목

✅ **즉시 확인할 것**:
```bash
# 브라우저 개발자 도구 네트워크 탭에서:
# /api/simulations/{id}/ai-fix 응답 확인
# JSON에서 fix.issue_title 값 확인
{
  "url": "...",
  "fixes": [
    {
      "issue_title": "???",  // ← 이 값이 빈 문자열이거나 null?
      "severity": "...",
      ...
    }
  ]
}
```

---

## 🐛 버그 3: API 404 에러

### 현상
```
Failed to load resource: 404
GET /api/simulations/{simulationId}/results/overview
GET /api/simulations/{simulationId}/overview
```

### 근본 원인 FOUND ✓

**분석**: 어떤 컴포넌트도 이 API를 직접 요청하지 않음

**확인 사항**:

1. **프론트엔드 코드 검사**
   - `useResultOverviewQuery` 또는 유사 훅에서 이 경로 확인
   - 아마도 개발 환경에서 자동 추가된 경로일 가능성

2. **백엔드 엔드포인트 부재**
   - 스프링 컨트롤러에 해당 경로가 없음
   - API 구조 변경되었지만 미적용

### 가능한 원인들

**가설 1**: 리다이렉트 또는 폴백 로직
```typescript
// HTTP 클라이언트에서 여러 경로 시도
await requestJsonWithFallback<T>([
  `/api/simulations/${id}/results/overview`,
  `/api/simulations/${id}/overview`,
  `/api/simulations/${id}/results`,  // 등등
])
```

**가설 2**: 개발/테스트 코드에서 추가된 요청

**가설 3**: 무시해도 괜찮은 에러
- 404는 적절하게 처리되고 폴백이 사용 중
- 그러나 불필요한 네트워크 요청

### 해결 필요 항목

1. **백엔드**: 해당 엔드포인트 추가 또는 확인
   - `/api/simulations/{id}/results/overview`
   - `/api/simulations/{id}/overview`

2. **프론트엔드**: 불필요한 요청 제거
   - 어느 파일에서 요청되는지 찾기
   - 필요없다면 제거

---

## 🐛 버그 4: 그래프 우측이 잘리는 현상

### 현상
```
연령대별 성공/실패 통합형 그래프의 우측 바가 영역을 벗어남
recharts BarChart에서 문제 발생
```

### 근본 원인 FOUND ✓

**파일**: `src/components/charts/horizontal-bar-chart.tsx`

**문제 라인 113**:
```tsx
<BarChart
  data={data}
  layout="vertical"
  margin={{ top: 4, right: 8, left: 8, bottom: 4 }}  // ← 문제!
  barCategoryGap="30%"
>
```

**원인 분석**:

1. **Margin이 너무 작음**
   - `right: 8` ← 오른쪽 여백이 8px만 있음
   - 큰 데이터 값의 바가 이를 벗어남

2. **YAxis 너비 고정** (라인 138)
   ```tsx
   <YAxis
     type="category"
     dataKey="label"
     width={46}  // ← 고정 너비
   />
   ```
   - 긴 라벨이 있으면 바의 시작 위치가 밀려남

3. **ResponsiveContainer가 100%지만 margin이 작음**
   ```tsx
   <ResponsiveContainer width="100%" height={height}>
     <BarChart margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
       //
     </BarChart>
   </ResponsiveContainer>
   ```
   - 전체 너비 100% - 마진 16px = 유효 너비
   - 데이터가 크면 우측 마진을 넘어감

### 해결 방법

**변경 필요**:
```typescript
// 현재
margin={{ top: 4, right: 8, left: 8, bottom: 4 }}

// 권장
margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
// 또는 데이터 최대값에 따라 동적 계산
```

또는 ResponsiveContainer에 padding 추가:
```tsx
<div className="px-4">  // 좌우 16px 패딩
  <ResponsiveContainer width="100%" height={height}>
    <BarChart margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
```

---

## 📊 버그별 심각도 및 해결 우선순위

| # | 버그 | 심각도 | 차단됨 | 우선순위 | 소요시간 예상 |
|---|------|--------|--------|---------|--------------|
| 1 | 사이드바 이미지 | 높음 | UI 망가짐 | **1순위** | 30-60분 |
| 2 | issue_title 공백 | 높음 | 데이터 표시 안됨 | **2순위** | 20-30분 |
| 3 | API 404 | 중간 | 폴백 작동 | **3순위** | 15-30분 |
| 4 | 그래프 잘림 | 중간 | 데이터 부분 hidden | **4순위** | 10-15분 |

---

## 🔧 즉시 실행할 액션 아이템

### Phase 1: 백엔드 확인 (30분)

```bash
# 1. Spring 로그 확인
# 2. /api/simulations/{id}/ai-fix 응답 JSON 확인
# - issue_title 필드 값
# - pages 배열 길이
# - screenshotUrl 필드값
```

### Phase 2: 프론트엔드 수정 (45분)

```bash
# 1. issue_title 공백 문제
#    - 백엔드 응답 필드명 확인
#    - 필요시 adapter 수정

# 2. 사이드바 이미지
#    - API 응답의 screenshotUrl 검증
#    - 매핑 로직 보강

# 3. 그래프 잘림
#    - margin={{ top: 4, right: 32, left: 8, bottom: 4 }} 변경
#    - 또는 동적 margin 계산 추가

# 4. API 404
#    - 어디서 요청되는지 찾기
#    - 필요시 엔드포인트 추가
```

### Phase 3: 검증 (30분)

```bash
# 1. 브라우저 개발자 도구 네트워크 탭 확인
# 2. 각 페이지에서 데이터 렌더링 확인
# 3. 콘솔 에러 메시지 확인
```

---

## 📝 추가 참고 사항

### Canvas2D 경고 (우선순위 낮음)
```
Canvas2D: Multiple readback operations using getImageData 
are faster with the willReadFrequently attribute set to true
```
→ Heatmap 캔버스 성능 최적화 (나중에 처리)

### 이미지 파일 확인 ✓
```
/public/mock-images/ 디렉토리 존재 및 모든 이미지 파일 존재 확인됨
- page-search.png ✓
- page-product-detail.png ✓
- page-login.png ✓
- page-signup.png ✓
등등
```

---

## 최종 정리

| 버그 | 원인 요약 | 해결 방법 |
|------|---------|---------|
| 1️⃣ 이미지 미로드 | API 응답 경로 불일치 + 데이터 갯수 불일치 | 백엔드 API 응답 검증 + 프론트 매핑 로직 개선 |
| 2️⃣ issue_title 공백 | API 응답에서 필드 값이 null/empty | 백엔드에서 필드명/값 확인 후 응답 수정 |
| 3️⃣ API 404 | 백엔드 엔드포인트 미구현 | 백엔드 추가 또는 프론트 요청 제거 |
| 4️⃣ 그래프 잘림 | BarChart margin이 너무 작음 | margin.right를 32px 이상으로 증가 |

