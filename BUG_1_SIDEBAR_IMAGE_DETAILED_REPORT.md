# 🔴 버그 1: 좌측 사이드바 페이지 이미지 스크린샷 미로드 - 상세 분석

**작성일**: 2026-05-25  
**상태**: 근본 원인 파악 완료, 추가 정보 필요  
**심각도**: 🔴 높음 (UI/UX 직접 영향)

---

## 📸 현상 재확인

사용자 보고:
```
"좌측 사이드바 페이지에 대한 해당되는 이미지 스크린샷이 제대로 로드되지 않았음. 
그래서 위 사진처럼 레이아웃 비율이 커져 망가진것 같아. 
또한 이게 페이지에 대한 DOM이 다 따져서 만들어져야하거든? 
그게 지금 목업으로 되어 있는 부분이 있는것 같기도하고 뭔가 이미지를 못불러오고 있음. 
페이지 갯수랑. 스프링에서 비즈니스로직에서는 제대로 json 파일과 DB가 제대로 나왔음. 
프론트쪽에서 제대로 못가져오고 있는 거임."
```

### 분석 결과

**이미지 자체는 존재함** ✓
```
/public/mock-images/ 디렉토리 확인:
✓ page-search.png (13MB)
✓ page-product-detail.png (13MB)  
✓ page-login.png (108KB)
✓ page-signup.png (96KB)
✓ page-main.png (6.1MB)
✓ page-cart.png (3.4MB)

모두 정상적으로 존재함
```

**→ 문제는 "이미지 자체" 가 아닌 "경로 매핑" 또는 "데이터 불일치"**

---

## 🔍 코드 흐름 분석

### Step 1: 백엔드 API 응답 (예상)

```json
{
  "url": "https://muun-shop-demo.s3-website-ap-northeast-2.amazonaws.com/search",
  "fixes": [
    {
      "issue_title": "검색 결과 필터 버튼 인식 실패",
      "selector": "...",
      "severity": "HIGH",
      // ...
    }
  ]
}
```

**또는 (Legacy 형식)**
```json
{
  "pages": [
    {
      "order": 1,
      "pageName": "검색 결과",
      "pageUrl": "https://muun-shop-demo.s3-website-ap-northeast-2.amazonaws.com/search",
      "screenshotUrl": "???",  // ← 여기가 중요!
      "totalFixCount": 5,
      "fixes": [...]
    }
  ]
}
```

### Step 2: Adapter에서 매핑

**파일**: `src/adapters/result/result-ai-fix.adapter.ts`

```typescript
// 라인 32-40: URL 기반 페이지명 + 스크린샷 URL 결정
function resolveScreenshotUrl(url: string) {
  if (url.includes("/search")) return getResultPageScreenshotUrl("search")
  if (url.includes("/articleDetail") || url.includes("/journal")) {
    return getResultPageScreenshotUrl("product")
  }
  if (url.includes("/login")) return getResultPageScreenshotUrl("login")
  if (url.includes("/signup")) return getResultPageScreenshotUrl("signup")
  return getResultPageScreenshotUrl()  // 폴백
}
```

### Step 3: 스크린샷 URL 생성

**파일**: `src/features/result/assets/result-screenshot-assets.ts`

```typescript
export function getResultPageScreenshotUrl(
  pageId?: string,
  fallback = RESULT_PAGE_SCREENSHOT_OPTIMIZED_URL
) {
  if (!pageId) return fallback  // "/mock-images/optimized/img-example-site.jpg"
  return RESULT_PAGE_SCREENSHOT_ASSETS[pageId as keyof typeof RESULT_PAGE_SCREENSHOT_ASSETS]?.full 
    ?? fallback
}

// 매핑 테이블
const RESULT_PAGE_SCREENSHOT_ASSETS = {
  search: {
    original: "/mock-images/page-search.png",
    full: "/mock-images/optimized/page-search.jpg",
    preview: "/mock-images/thumbs/page-search.jpg",
    expectedNaturalWidth: 3158,
    expectedNaturalHeight: 12308,
  },
  // 모든 페이지 유형이 정의됨
}
```

### Step 4: 사이드바에서 사용

**파일**: `src/pages/result/ResultAiFixPage.tsx` (라인 250-266)

```typescript
const sidePages = useMemo(
  () =>
    pages.map((page) => {
      const screenshotSet = resolveResultPageScreenshotSet({
        pageId: page.pageId,
        screenshotUrl: page.screenshotUrl,  // ← 여기에 뭐가 들어오는가?
      })

      return {
        id: page.pageId,
        name: page.pageName,
        url: page.pageUrl,
        previewUrl: screenshotSet.previewUrl,  // ← 이것이 사용됨
      }
    }),
    [pages]
)
```

---

## 🔴 **문제점 1: 데이터 경로 불일치**

### 시나리오 A: 백엔드에서 실제 경로를 반환하는 경우

백엔드 응답:
```json
{
  "url": "https://muun-shop-demo.s3-website-ap-northeast-2.amazonaws.com/search",
  "fixes": [{...}],
  "screenshotUrl": "/uploads/screenshots/muun_search_20260525.jpg"  // 실제 서버 경로
}
```

프론트 처리:
```typescript
// resolveScreenshotUrl()에 screenshotUrl이 이미 있음
// 그런데 URL 기반 매핑이 우선됨 (라인 32-40)

function resolvePageName(url: string) {
  if (url.includes("/search")) return "검색 결과"  // ✓ 맞음
}

function resolveScreenshotUrl(url: string) {
  if (url.includes("/search")) 
    return getResultPageScreenshotUrl("search")  // ✓ "/mock-images/optimized/page-search.jpg"
}

// → MOCK 이미지를 강제로 사용
// → 실제 업로드된 이미지는 무시됨
```

**문제**: 백엔드에서 실제 스크린샷을 업로드했는데, 프론트가 MOCK 이미지를 고집함

---

## 🔴 **문제점 2: 페이지 개수 불일치**

사용자 보고: "페이지 갯수랑. 애초에 지금 각 페이지 마다 결과 페이지 갯수도 다 다름"

### 의심 포인트

```typescript
// AI Fix Page (라인 198)
const pages = useMemo(() => data?.pages ?? [], [data])

// 만약 API 응답에서:
// - 첫 번째 페이지: 3개 이슈
// - 두 번째 페이지: 5개 이슈
// - 세 번째 페이지: 2개 이슈

// 이것이 제대로 렌더링되지 않으면?
// 예: 모든 페이지가 같은 수의 이슈를 표시?
// → adapter에서 데이터 누락?
```

---

## 🔴 **문제점 3: 목업과 실제 데이터 혼재**

사용자 보고: "그게 지금 목업으로 되어 있는 부분이 있는것 같기도"

### 코드에서 발견된 목업 사용

**파일**: `src/services/result/result-ai-fix.service.ts`

```typescript
const AI_FIX_FALLBACK_PATH = "/_mock_AI수정.json"  // 목업 파일

export const resultAiFixService: ResultAiFixService = {
  async getAiFix(simulationId) {
    if (SERVICE_CONFIG.useSimulationMock) {  // ← 이 플래그가 켜져있나?
      const fallbackViewModel = await getAiFixFallback(simulationId)
      return fallbackViewModel ?? { pages: [] }
    }

    try {
      const apiResponse = await requestJsonWithFallback<SimulationAiFixApiResponseDto>([
        `/api/simulations/${simulationId}/ai-fix`,
        // ...
      ])
      // ...
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        if (import.meta.env.DEV) {  // ← 개발 환경에서 자동으로 목업 사용
          const fallbackViewModel = await getAiFixFallback(simulationId)
          if (fallbackViewModel) {
            return fallbackViewModel
          }
        }
        return { pages: [] }
      }
    }
  }
}
```

**문제**: API가 404를 반환하거나 개발 환경이면 자동으로 목업이 사용됨

---

## 📋 **필요한 확인 사항**

### 확인 1: 실제 API 응답 구조

**브라우저 개발자 도구 → Network 탭 → `/api/simulations/{id}/ai-fix`**

응답 JSON을 확인하고 다음을 기록:

```
1. API가 반환하는 필드 목록:
   - "url" 있는가? 
   - "fixes" 있는가?
   - "screenshotUrl" 있는가?
   
   또는
   
   - "pages" 있는가?
   - pages[0].screenshotUrl 있는가?

2. pages 또는 fixes 배열의 길이
   - 모두 동일한 길이인가?
   - 각 페이지의 이슈 개수가 다른가?

3. screenshotUrl 필드값 (있다면)
   - "/mock-images/..." 형식?
   - "/uploads/..." 형식?
   - 완전한 URL?
   - null 또는 빈 문자열?
```

### 확인 2: 개발 환경 설정

**파일**: `src/services/core/service-config.ts`

```typescript
export const SERVICE_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  useSimulationMock: import.meta.env.VITE_USE_SIMULATION_MOCK === "true",
  // ...
}
```

**확인**: `.env` 또는 `.env.production` 파일에서
- `VITE_USE_SIMULATION_MOCK` 값?
- `VITE_API_BASE_URL` 값?

### 확인 3: 이미지 로드 에러

**브라우저 개발자 도구 → Console 또는 Network 탭**

```
이미지 요청이 실패하는가?
GET /mock-images/optimized/page-search.jpg → 404?
또는 200?

만약 404라면:
- dist/mock-images/ 디렉토리가 배포되지 않았을 수 있음
```

---

## 💡 **근본 원인 가설 (우선순위 순)**

### 🥇 가설 1: 백엔드에서 실제 경로 반환 + 프론트가 무시
```
백엔드: "screenshotUrl": "/uploads/screenshots/search_20250525.jpg"
프론트: getResultPageScreenshotUrl("search") 강제 사용
→ 결과: 항상 MOCK 이미지만 표시
→ 증상: 모든 페이지가 같은 이미지?
```

### 🥈 가설 2: 이미지 파일 배포 누락
```
빌드 시 /public/mock-images/ 가 dist/ 에 복사되지 않음
→ 404 에러 발생
→ img 태그가 로드 실패
→ 높이 축소, 레이아웃 깨짐
```

### 🥉 가설 3: API 404 + 자동 목업 사용
```
/api/simulations/{id}/ai-fix → 404
→ dev 환경이면 _mock_AI수정.json 사용
→ 목업 데이터가 페이지 정보 누락?
→ pages 배열이 비어있거나 incomplete?
```

### 🔷 가설 4: 데이터 유형 변경
```
백엔드가 Business 응답 형식 사용 (url + fixes)
프론트가 Legacy 형식 예상 (pages 배열)
→ adapter에서 올바르게 변환 실패?
```

---

## 🔧 **임시 해결 방안**

### 옵션 A: 강제로 MOCK 데이터 확인
```typescript
// src/services/result/result-ai-fix.service.ts에 로깅 추가
const apiResponse = await requestJsonWithFallback<...>(...)

console.log("AI Fix API Response:", apiResponse)  // ← 응답 구조 확인
console.log("Pages:", apiResponse.pages ?? [])
console.log("Fixes:", apiResponse.fixes ?? [])
```

### 옵션 B: screenshotUrl 우선순위 변경
```typescript
// src/adapters/result/result-ai-fix.adapter.ts

// 현재: 항상 URL 기반 매핑 사용
function resolveScreenshotUrl(url: string) {
  if (url.includes("/search")) return getResultPageScreenshotUrl("search")
  // ...
}

// 변경: API 응답의 screenshotUrl 우선 사용
function resolveScreenshotUrl(apiUrl: string, apiScreenshotUrl?: string) {
  // 1. API에서 준 경로가 있으면 사용
  if (apiScreenshotUrl && apiScreenshotUrl.trim()) {
    return apiScreenshotUrl
  }
  
  // 2. 없으면 URL 기반 매핑
  if (apiUrl.includes("/search")) return getResultPageScreenshotUrl("search")
  // ...
}
```

---

## 📊 **체크리스트**

해결하기 위해 수행할 작업:

- [ ] 브라우저에서 `/api/simulations/{id}/ai-fix` 응답 JSON 전체 복사
- [ ] 응답의 구조 확인 (Business vs Legacy 형식)
- [ ] screenshotUrl 필드값 확인
- [ ] 이미지 요청 URL 확인 (Network 탭)
- [ ] dist/mock-images/ 디렉토리 존재 여부 확인
- [ ] SERVICE_CONFIG.useSimulationMock 값 확인
- [ ] 백엔드 로그에서 ai-fix 엔드포인트 응답 확인

---

## 🎯 **다음 단계**

1. **즉시**: 브라우저 개발자 도구에서 API 응답 캡처
2. **분석**: 응답 구조와 데이터 일관성 확인
3. **수정**: 
   - 백엔드: screenshotUrl 필드 누락 시 추가
   - 프론트: adapter에서 우선순위 조정
4. **검증**: 각 페이지의 이미지 정상 로드 확인

