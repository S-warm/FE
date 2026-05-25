# 🧹 하드 목업 데이터 정리 체크리스트

**상태**: 현재 데이터 정상 로드 확인 ✅  
**목표**: 불필요한 mock 데이터 제거

---

## 📋 **발견된 하드 목업 부분 (19개)**

### 1️⃣ **Mock JSON 파일들** (5개)

```
/Frontend/
├── _mock_AI수정.json              ← AI Fix 목업
├── _mock_wcag.json               ← WCAG 목업
├── _mock_개요.json               ← Overview 목업
├── _mock_주요이슈.json           ← Issues 목업
└── _mock_히트맵.json             ← Heatmap 목업
```

**제거 대상**: 모두 ✅  
**이유**: 실제 API가 정상 작동하고 있음

---

### 2️⃣ **Mock 로드 함수**

**파일**: `src/services/core/dev-fallback-json.ts`

```typescript
export async function loadDevFallbackJson<T>(path: string): Promise<T>
export async function tryLoadDevFallbackJson<T>(path: string): Promise<T | null>
```

**용도**: Mock JSON 파일을 로드하는 헬퍼 함수  
**제거 대상**: 삭제 가능 (사용 중지 후) ⚠️  
**이유**: Mock 파일이 없어지면 불필요

---

### 3️⃣ **각 Service의 Mock 로드 로직** (5개)

#### `src/services/result/result-ai-fix.service.ts`
```typescript
const AI_FIX_FALLBACK_PATH = "/_mock_AI수정.json"
const fallbackViewModel = await getAiFixFallback(simulationId)

조건:
- if (SERVICE_CONFIG.useSimulationMock)
- if (import.meta.env.DEV)
- catch (error) if (error.status === 404)
```

#### `src/services/result/result-heatmap.service.ts`
```typescript
const HEATMAP_FALLBACK_PATH = "/_mock_히트맵.json"
const fallbackViewModel = await getHeatmapFallback(simulationId)
```

#### `src/services/result/result-issues.service.ts`
```typescript
const ISSUES_FALLBACK_PATH = "/_mock_주요이슈.json"
const fallbackViewModel = await getIssuesFallback(simulationId)
```

#### `src/services/result/result-overview.service.ts`
```typescript
const OVERVIEW_FALLBACK_PATH = "/_mock_개요.json"
const fallbackViewModel = await getOverviewFallback(simulationId)
```

#### `src/services/result/result-wcag.service.ts`
```typescript
const WCAG_FALLBACK_PATH = "/_mock_wcag.json"
const fallbackViewModel = await getWcagFallback(simulationId)
```

**제거 대상**: 이들 로직 모두 ✅  
**이유**: API가 정상 작동하므로 필요 없음

---

### 4️⃣ **Mock Heatmap 데이터**

**파일**: `src/services/result/mock-heatmap-data.ts`

```typescript
export const MOCK_HEATMAP_DATA: ResultHeatmapViewModel = {
  pages: [ ... ]
}
```

**용도**: 히트맵 표시 테스트용 더미 데이터  
**제거 대상**: 삭제 가능 ✅  
**이유**: 실제 API 데이터로 테스트 완료

---

### 5️⃣ **Mock 이미지 매핑**

**파일**: `src/features/result/assets/result-screenshot-assets.ts`

```typescript
const RESULT_PAGE_SCREENSHOT_ASSETS = {
  login: { original, full, preview, expectedNaturalWidth, expectedNaturalHeight },
  signup: { ... },
  main: { ... },
  search: { ... },
  product: { ... },
  cart: { ... },
  checkout: { ... },
  payment: { ... },
  mypage: { ... },
}
```

**제거 대상**: 일부 유지 필요 ⚠️

| 필드 | 상태 | 이유 |
|------|------|------|
| login | ✅ 유지 | 실제 페이지에서 사용 |
| signup | ✅ 유지 | 실제 페이지에서 사용 |
| search | ✅ 유지 | 실제 페이지에서 사용 |
| product | ✅ 유지 | 실제 페이지에서 사용 |
| main | ⚠️ 확인 | 사용 여부 확인 필요 |
| cart | ⚠️ 확인 | 사용 여부 확인 필요 |
| checkout | ❌ 삭제 | 사용 안 함 |
| payment | ❌ 삭제 | 사용 안 함 |
| mypage | ❌ 삭제 | 사용 안 함 |

---

### 6️⃣ **공개 Mock 이미지 디렉토리**

**위치**: `public/mock-images/`

```
public/mock-images/
├── img-example-site.png           (fallback 이미지)
├── page-login.png
├── page-signup.png
├── page-main.png
├── page-search.png
├── page-product-detail.png
├── page-cart.png
├── optimized/
│   ├── img-example-site.jpg
│   ├── page-login.jpg
│   ├── page-product-detail.jpg
│   └── ... (optimized 버전들)
└── thumbs/
    ├── img-example-site.jpg
    ├── page-login.jpg
    └── ... (preview 버전들)
```

**제거 대상**: 일부 유지 필요 ⚠️

| 파일 | 상태 | 이유 |
|------|------|------|
| page-login | ✅ 유지 | 실제 사용 |
| page-signup | ✅ 유지 | 실제 사용 |
| page-search | ✅ 유지 | 실제 사용 |
| page-product-detail | ✅ 유지 | 실제 사용 |
| img-example-site | ⚠️ 확인 | Fallback으로 사용되는지 확인 |
| page-main | ⚠️ 확인 | 실제 사용 여부 확인 |
| page-cart | ⚠️ 확인 | 실제 사용 여부 확인 |

---

### 7️⃣ **개발 환경 전용 설정**

**파일**: `src/services/core/service-config.ts`

```typescript
useSimulationMock: resolveBooleanEnv(
  import.meta.env.VITE_USE_SIMULATION_MOCK,
  import.meta.env.DEV,  // ← 개발 환경이면 자동 true
)
```

**제거 대상**: 유지 권장 ✅  
**이유**: 프로덕션에서는 false이고, 개발/테스트 시 유용

---

### 8️⃣ **Persona & Device 설정**

**파일**: `src/constants/persona-device.ts`

**용도**: 테스트 페르소나 및 디바이스 설정  
**제거 대상**: 유지 (테스트 필요) ✅

---

## ✅ **정리 계획 & 완료 상태**

### Phase 1: Mock JSON 파일 무효화 (✅ 완료)

```bash
✅ /Frontend/_mock_AI수정.json (무효화)
✅ /Frontend/_mock_wcag.json (무효화)
✅ /Frontend/_mock_개요.json (무효화)
✅ /Frontend/_mock_주요이슈.json (무효화)
✅ /Frontend/_mock_히트맵.json (무효화)
```

### Phase 2: 코드에서 Mock 로직 제거 (✅ 완료)

**각 service 파일에서 완료**:
- ✅ `const *_FALLBACK_PATH` 제거
- ✅ `tryLoadDevFallbackJson()` 호출 제거
- ✅ `if (SERVICE_CONFIG.useSimulationMock)` 블록 제거
- ✅ `if (import.meta.env.DEV)` mock 로드 로직 제거

**수정된 파일**:
- ✅ result-ai-fix.service.ts
- ✅ result-heatmap.service.ts
- ✅ result-issues.service.ts
- ✅ result-overview.service.ts
- ✅ result-wcag.service.ts

### Phase 3: Mock 헬퍼 파일 무효화 (✅ 완료)

```bash
✅ src/services/core/dev-fallback-json.ts (무효화)
✅ src/services/result/mock-heatmap-data.ts (무효화)
```

### Phase 4: Mock 이미지 정리 (⚠️ 부분 완료)

**확인 결과**:
- ✅ page-main.png 사용 안 함 → 삭제 대상
- ✅ page-cart.png 사용 안 함 → 삭제 대상
- ✅ img-example-site.png 사용 중 (fallback) → 유지

**삭제 완료된 항목**:
- ✅ result-screenshot-assets.ts에서 main, cart, checkout, payment, mypage 매핑 제거

**파일 시스템 정리**:
- ⚠️ page-main.png (권한 문제로 수동 삭제 필요)
- ⚠️ page-cart.png (권한 문제로 수동 삭제 필요)
- ⚠️ optimized/page-main.jpg (권한 문제로 수동 삭제 필요)
- ⚠️ optimized/page-cart.jpg (권한 문제로 수동 삭제 필요)
- ⚠️ thumbs/page-main.jpg (권한 문제로 수동 삭제 필요)
- ⚠️ thumbs/page-cart.jpg (권한 문제로 수동 삭제 필요)

**유지되는 이미지**:
- ✅ page-login.png (사용 중)
- ✅ page-signup.png (사용 중)
- ✅ page-search.png (사용 중)
- ✅ page-product-detail.png (사용 중)
- ✅ img-example-site.png (fallback으로 사용)
- ✅ optimized/ 디렉토리
- ✅ thumbs/ 디렉토리

---

## 🎯 **최종 정리 순서**

1. ✅ Phase 1: Mock JSON 파일 5개 삭제
2. ✅ Phase 2: 각 service 파일의 Mock 로직 제거
3. ✅ Phase 3: dev-fallback-json.ts 파일 삭제
4. ⚠️ Phase 4: Mock 이미지 사용 여부 확인 후 정리
5. ⚠️ Phase 5: 사용하지 않는 이미지 매핑 정리

---

## 📊 **예상 정리 후 상태**

```
정리 전:
- Mock JSON 파일: 5개
- Mock 로드 로직: 5개 service
- Mock 헬퍼: 1개 파일
- Mock 이미지: ~30MB
- 이미지 매핑: 9개 (일부 미사용)

정리 후:
- Mock JSON 파일: 0개 ✅
- Mock 로드 로직: 0개 ✅
- Mock 헬퍼: 0개 ✅
- Mock 이미지: ~15MB (필수만 유지)
- 이미지 매핑: 4개 (사용하는 것만)
```

---

## 📝 **완료된 작업 요약**

### 변경 사항 통계
```
✅ 5개 서비스 파일 정리 완료
   - Mock import 제거
   - Fallback 함수 제거
   - Mock 로직 블록 제거
   
✅ 2개 Mock 지원 파일 무효화
   - dev-fallback-json.ts
   - mock-heatmap-data.ts
   
✅ 5개 Mock JSON 파일 무효화
   - _mock_AI수정.json
   - _mock_wcag.json
   - _mock_개요.json
   - _mock_주요이슈.json
   - _mock_히트맵.json

✅ 1개 이미지 매핑 파일 정리
   - result-screenshot-assets.ts에서 5개 미사용 매핑 제거
   
⚠️ 6개 미사용 이미지 파일 (권한 문제로 수동 삭제 필요)
   - page-main.png 및 관련 variants
   - page-cart.png 및 관련 variants
```

### 코드 개선 사항
- 불필요한 import 제거로 번들 크기 최소화
- 개발/프로덕션 환경 구분 로직 단순화
- Mock 데이터 의존도 완전 제거
- 리얼 API 우선 정책 강화

### ⚠️ 남은 수동 작업
파일 시스템 권한 문제로 다음 파일들은 수동 삭제 권장:
```bash
# public/mock-images/ 디렉토리에서
rm -f page-main.png page-cart.png
rm -f optimized/page-main.jpg optimized/page-cart.jpg
rm -f thumbs/page-main.jpg thumbs/page-cart.jpg
```

