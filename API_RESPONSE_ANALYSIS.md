# 📊 모든 API 응답 구조 및 처리 방식 검증

**분석 날짜**: 2026-05-25  
**목표**: screenshotUrl null 처리 확인 및 레이아웃 깨짐 방지 검증

---

## 1️⃣ **AI Fix API** (`/api/simulations/{id}/ai-fix`)

### API 응답 구조
```json
{
  "pages": [
    {
      "order": 1,
      "pageUrl": "...",
      "screenshotUrl": "https://swarm-logs-bucket.../screenshots/...png?X-Amz-Algorithm=...",
      "totalFixCount": 2,
      "fixes": [...]
    }
  ]
}
```

### 프론트 처리
**파일**: `src/adapters/result/result-ai-fix.adapter.ts`

```typescript
// Legacy 형식 처리 (라인 81-104)
screenshotUrl: page.screenshotUrl,
```

**✅ 문제 없음**: API의 screenshotUrl 직접 사용

### null 처리 여부
- API: **항상 값 있음** (테스트 데이터)
- 프론트: **값 있으면 사용, 없으면 MOCK**

---

## 2️⃣ **Issues API** (`/api/simulations/{id}/issues`)

### API 응답 구조 (사용자 제공)
```json
{
  "pages": [
    {
      "order": 1,
      "pageUrl": "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/category.html",
      "screenshotUrl": "https://swarm-logs-bucket.../screenshots/...png?X-Amz-Algorithm=...",
      "totalIssueCount": 2,
      "issues": [...]
    },
    {
      "order": 2,
      "pageUrl": "...",
      "screenshotUrl": "https://...",
      "totalIssueCount": 2,
      "issues": [...]
    }
  ]
}
```

### 프론트 처리
**파일**: `src/adapters/result/result-issues.adapter.ts`

```typescript
// 라인 21-25
function resolveScreenshotUrl(url: string, screenshotUrl?: string) {
  if (screenshotUrl?.trim()) {
    return screenshotUrl  // ✅ API 값 우선 사용
  }
  // ... MOCK 매핑
}

// 라인 137
screenshotUrl: page.screenshotUrl,  // Legacy 형식도 직접 사용
```

**✅ 문제 없음**: API의 screenshotUrl 직접 사용

### null 처리 여부
- API: **항상 값 있음** (테스트 데이터)
- 프론트: **값 있으면 사용, 없으면 MOCK**

---

## 3️⃣ **Heatmap API** (`/api/simulations/{id}/heatmap`)

### API 응답 구조 (사용자 제공)
```json
{
  "pages": [
    {
      "order": 1,
      "pageUrl": "...",
      "screenshotUrl": "https://swarm-logs-bucket.../screenshots/...png?X-Amz-Algorithm=...",
      "totalErrorCount": 3,
      "errorPoints": [...]
    },
    {
      "order": 2,
      "pageUrl": "...",
      "screenshotUrl": "https://...",
      "totalErrorCount": 4,
      "errorPoints": [...]
    },
    {
      "order": 3,
      "pageUrl": "...",
      "screenshotUrl": null,  // ❌ NULL!
      "totalErrorCount": 0,
      "errorPoints": []
    },
    {
      "order": 4,
      "pageUrl": "...",
      "screenshotUrl": null,  // ❌ NULL!
      "totalErrorCount": 0,
      "errorPoints": []
    },
    {
      "order": 5,
      "pageUrl": "...",
      "screenshotUrl": null,  // ❌ NULL!
      "totalErrorCount": 0,
      "errorPoints": []
    }
  ]
}
```

### 프론트 처리
**파일**: `src/adapters/result/result-heatmap.adapter.ts`

```typescript
// 라인 100-101: Business 형식 (단일 페이지)
screenshotUrl: resolveScreenshotUrl(raw.url),

// 라인 137: Legacy 형식 (여러 페이지)
screenshotUrl: page.screenshotUrl,
```

**⚠️ 문제 있음**: 
- null이 그대로 전달됨
- resolveScreenshotUrl()도 MOCK 매핑하지 않음

### null 처리 여부
- API: **일부 null** (order 3, 4, 5)
- 프론트: **null 처리 없음** ❌

---

## 4️⃣ **WCAG API** (`/api/simulations/{id}/wcag`)

### 응답 구조 (추정)
```json
{
  "pages": [
    {
      "order": 1,
      "pageUrl": "...",
      // screenshotUrl은? 확인 필요
      "wcagIssues": [...]
    }
  ]
}
```

### 프론트 처리
**파일**: `src/adapters/result/result-wcag.adapter.ts`

```typescript
// 라인 101: Business 형식
screenshotUrl: resolveScreenshotUrl(url),

// 라인 144, 183: Legacy 형식
screenshotUrl: undefined,  // ❌ undefined!
```

**❌ 문제**: 
- Legacy 형식에서 screenshotUrl을 `undefined`로 설정
- 사이드바에서 이미지 안 보임

---

## 🔴 **발견된 문제들**

### 문제 1: Heatmap의 null screenshotUrl 미처리
```
상황: order 3, 4, 5의 screenshotUrl이 null
결과: previewUrl이 null → 사이드바에서 "이미지를 불러올 수 없습니다" 표시 (정상)
```

✅ **사이드바는 안전**: aspect-ratio 고정 + null 처리 있음

### 문제 2: WCAG API에서 screenshotUrl이 undefined
```
상황: Legacy 형식에서 screenshotUrl: undefined
코드: screenshotUrl: undefined,  // 라인 144, 183
결과: 사이드바에서 "이미지를 불러올 수 없습니다" 표시 (정상)
```

✅ **사이드바는 안전**: null/undefined 모두 처리됨

### 문제 3: 메인 콘텐츠 영역의 이미지 컨테이너
```
이미지가 없으면 → 폴백이 필요
컨테이너 높이가 정의되지 않으면 → 레이아웃 깨짐
```

❌ **확인 필요**: ResultHeatmapPage, ResultIssuesPage 등에서 이미지 없을 때 처리

---

## ✅ **검증 결과**

| API | null 처리 | 사이드바 안전 | 메인 콘텐츠 | 상태 |
|-----|---------|-----------|----------|------|
| AI Fix | ✅ 예 | ✅ Yes | ❓ 확인 필요 | 안전 |
| Issues | ✅ 예 | ✅ Yes | ❓ 확인 필요 | 안전 |
| Heatmap | ❌ 아니오 | ✅ Yes | ❓ 확인 필요 | **문제!** |
| WCAG | ❌ 아니오 | ✅ Yes | ❓ 확인 필요 | **문제!** |

---

## 🔍 **메인 콘텐츠 영역 이미지 처리 확인 필요**

### ResultHeatmapPage
```typescript
// 라인 253-263: 화면에 표시되는 이미지
const screenshotSet = resolveResultPageScreenshotSet({
  pageId: page.pageId,
  screenshotUrl: page.screenshotUrl,  // ← null이면?
})

// 결과로 screenshotSet.fullUrl이 사용됨
// null인 경우 어떻게 처리되는가?
```

**확인 사항**:
1. `resolveResultPageScreenshotSet()` 함수가 null 처리하는가?
2. 메인 이미지 컴포넌트에서 높이 고정이 있는가?
3. 이미지 로드 실패 시 폴백이 있는가?

---

## 🎯 **결론**

### 사이드바는 안전함 ✅
- null/undefined 처리 있음
- aspect-ratio로 높이 고정
- 폴백 메시지 있음

### **메인 콘텐츠 영역은 확인 필요** ❓
- Heatmap, WCAG에서 null screenshotUrl 처리 필요
- 메인 이미지 컴포넌트의 높이 처리 확인 필요
- null 이미지 시 레이아웃이 깨지는지 확인 필요

### **다음 단계**
1. Heatmap/WCAG의 null screenshotUrl → 폴백 이미지로 변경
2. 메인 이미지 컴포넌트의 null 처리 확인
3. 이미지 없을 때 레이아웃 유지 확인

