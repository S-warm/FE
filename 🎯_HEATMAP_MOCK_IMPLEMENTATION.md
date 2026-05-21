# 🎯 히트맵 Mock 데이터 연동 구현 가이드

**작성일**: 2026년 5월 21일  
**목표**: 옅고 은은한 원형 히트맵 렌더링 + Mock 데이터 연동

---

## 📊 변경 사항 요약

### 1. 히트맵 드로우 파라미터 최적화

#### Before (기존)
```typescript
// 반지름: 68~172px (매우 큼)
// 알파: 0.24~0.74 (진함)
// 결과: 겹치면 어둡고 답답함
```

#### After (개선)
```typescript
const HEATMAP_CONFIG = {
  baseRadius: 35,           // 기본 반지름 (px) - 작고 부드럽게
  countRadiusMultiplier: 5, // count에 따른 반지름 증가
  baseAlpha: 0.18,          // 기본 투명도 - 낮고 은은하게
  alphaMultiplier: 0.12,    // count에 따른 알파 증가
}

// 반지름: 30~50px (작고 정밀함)
// 알파: 0.18~0.48 (은은함)
// 결과: 각 포인트가 독립적으로 시각화되고, 겹쳐도 부드럽게 쌓임
```

### 2. 함수 단순화

#### getSeverityWeight 제거
- 기존: count + severity 복합 계산
- 개선: severity 기반 색상만 사용

#### getHeatRadius 단순화
```typescript
// Before:
// return 68 + countRatio * 76 + getSeverityWeight(point) * 28

// After:
function getHeatRadius(count: number) {
  return HEATMAP_CONFIG.baseRadius + (count - 1) * HEATMAP_CONFIG.countRadiusMultiplier
  // 30~50px 범위
}
```

#### getHeatAlpha 단순화
```typescript
// Before:
// return 0.24 + score * 0.5

// After:
function getHeatAlpha(count: number) {
  return Math.min(0.48, HEATMAP_CONFIG.baseAlpha + (count - 1) * HEATMAP_CONFIG.alphaMultiplier)
  // 0.18~0.48 범위
}
```

### 3. 라디얼 그래디언트 조정

#### Before
```typescript
gradient.addColorStop(0, `rgba(${color}, ${Math.min(alpha * 1.18, 0.92)})`)
gradient.addColorStop(0.14, `rgba(${color}, ${Math.min(alpha * 1.02, 0.84)})`)
gradient.addColorStop(0.34, `rgba(${color}, ${alpha * 0.72})`)
gradient.addColorStop(0.58, `rgba(${color}, ${alpha * 0.34})`)
gradient.addColorStop(0.82, `rgba(${color}, ${alpha * 0.1})`)
gradient.addColorStop(1, `rgba(${color}, 0)`)
```

#### After
```typescript
gradient.addColorStop(0, `rgba(${color}, ${alpha * 0.9})`)      // 중심: 약간 진함
gradient.addColorStop(0.25, `rgba(${color}, ${alpha * 0.65})`)  // 25%: 감소
gradient.addColorStop(0.5, `rgba(${color}, ${alpha * 0.35})`)   // 중간: 더 희미함
gradient.addColorStop(0.75, `rgba(${color}, ${alpha * 0.12})`)  // 75%: 매우 희미함
gradient.addColorStop(1, `rgba(${color}, 0)`)                   // 끝: 투명
```

**장점**: 더 부드러운 페이드 아웃 + 중심이 너무 밝지 않음

---

## 🔄 Mock 데이터 연동 흐름

### 1. 데이터 구조

#### ErrorPoint (입력 데이터)
```typescript
interface ErrorPoint {
  issueId: string
  url: string
  x: number                                    // 0.0 ~ 1.0 ratio
  y: number                                    // 0.0 ~ 1.0 ratio
  ageBand: string                              // "20s", "50s" 등
  count: number                                // 발생 횟수
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  errorType: string
}
```

#### ResultHeatmapPointViewModel (변환 후)
```typescript
interface ResultHeatmapPointViewModel {
  issueId: string
  x: number
  y: number
  count: number
  severity: {
    rank: number              // 1~4
    tone: string              // "success", "info", "warning", "error"
  }
  errorType: string
  affectedUsersCount: number
  blockRate: number
  repeatCount: number
  description: string
  ageBand: ResultAgeFilter
  errorBreakdown: {
    timeout: number
    network: number
    console: number
  }
}
```

### 2. 변환 함수

```typescript
function convertErrorPointToViewModel(
  errorPoint: ErrorPoint,
  pageData: any,
): ResultHeatmapPointViewModel {
  const severityRank = getSeverityRank(errorPoint.severity)

  return {
    issueId: errorPoint.issueId,
    x: errorPoint.x,              // Ratio 좌표 (0~1)
    y: errorPoint.y,              // Ratio 좌표 (0~1)
    count: errorPoint.count || 1,
    severity: {
      rank: severityRank,
      tone: getSeverityTone(errorPoint.severity),
    },
    errorType: errorPoint.errorType,
    affectedUsersCount: errorPoint.count || 1,
    blockRate: Math.random() * 100,  // Mock 데이터
    repeatCount: Math.random() * 5,  // Mock 데이터
    description: `${errorPoint.errorType} (${errorPoint.ageBand})`,
    ageBand: (errorPoint.ageBand || "all") as ResultAgeFilter,
    errorBreakdown: {                // Mock 데이터
      timeout: Math.floor(Math.random() * 10),
      network: Math.floor(Math.random() * 10),
      console: Math.floor(Math.random() * 10),
    },
  }
}
```

### 3. Mock 데이터 파일 구조

**파일**: `/src/services/result/mock-heatmap-data.ts`

```typescript
export const MOCK_HEATMAP_DATA = {
  "page-main": {
    pageId: "page-main",
    pageName: "메인 페이지",
    pageUrl: "...",
    screenshotUrl: "/mock-images/heatmap-1.png",
    coordinateMode: "ratio",
    errorPoints: [
      { issueId: "issue_001", x: 0.051, y: 0.13, ... },
      { issueId: "issue_002", x: 0.35, y: 0.15, ... },
      // ...
    ]
  },
  "page-product-detail": {
    // ...
  }
}
```

---

## 🎨 색상 매핑

```typescript
function getHeatColor(severity: string) {
  switch (severity) {
    case "CRITICAL": return "239, 68, 68"    // 빨강
    case "HIGH":     return "249, 115, 22"   // 주황
    case "MEDIUM":   return "251, 191, 36"   // 노랑
    case "LOW":      return "34, 197, 94"    // 녹색
    default:         return "59, 130, 246"   // 파랑
  }
}
```

---

## 📐 좌표 변환 (Ratio → 화면 픽셀)

```
입력: x=0.051, y=0.13 (Ratio 0~1)
      ↓
coordinateMode="ratio" → resolvePointRatios
      ↓
xRatio=0.051, yRatio=0.13
      ↓
resolvePointPixels (메트릭 사용)
      ↓
left = 0.051 * displayWidth
top = 0.13 * displayHeight
      ↓
Canvas: arc(left, top, radius, 0, Math.PI * 2)
```

---

## 🖼️ Mock 이미지 설정

### 이미지 위치
```
/Frontend/public/mock-images/heatmap-1.png  (메인 페이지)
/Frontend/public/mock-images/heatmap-2.png  (상품 상세 페이지)
```

### 이미지 크기 권장사항
- **최소**: 800x600px (반응형 처리)
- **권장**: 1200x900px (선명하고 상세함)
- **최대**: 1920x1440px (고해상도)

### Mock 데이터 좌표 기준
- x: 0.0 (왼쪽) ~ 1.0 (오른쪽)
- y: 0.0 (상단) ~ 1.0 (하단)

**예**:
- 좌상단: (0.0, 0.0)
- 중앙: (0.5, 0.5)
- 우하단: (1.0, 1.0)

---

## 🔧 실제 구현 흐름

```typescript
// ResultHeatmapPage.tsx

function ResultHeatmapPage() {
  // 1. Mock 데이터 로드
  const mockPageData = useMemo(() => {
    const { MOCK_HEATMAP_DATA } = require("@/services/result/mock-heatmap-data")
    return MOCK_HEATMAP_DATA[selectedPageId] || MOCK_HEATMAP_DATA["page-main"]
  }, [selectedPageId])

  // 2. ErrorPoint → ResultHeatmapPointViewModel 변환
  const convertedPoints = useMemo(() => {
    return mockPageData.errorPoints.map((errorPoint) =>
      convertErrorPointToViewModel(errorPoint, mockPageData),
    )
  }, [mockPageData])

  // 3. 필터링 (ageFilter 적용)
  const filteredPoints = useMemo(() => {
    if (ageFilter === "all") return convertedPoints
    return convertedPoints.filter((point) => point.ageBand === ageFilter)
  }, [convertedPoints, ageFilter])

  // 4. ResultHeatmapPageViewModel 생성
  const pages = useMemo<ResultHeatmapPageViewModel[]>(() => {
    return [
      {
        pageId: mockPageData.pageId,
        pageName: mockPageData.pageName,
        pageUrl: mockPageData.pageUrl,
        screenshotUrl: mockPageData.screenshotUrl,
        currentAgeGroup: ageFilter,
        coordinateMode: "ratio",
        points: filteredPoints,          // ← 변환된 포인트들
        metaText: `${filteredPoints.length}개 오류 포인트`,
        pagination: { ... }
      }
    ]
  }, [mockPageData, filteredPoints, ageFilter])

  // 5. Canvas 렌더링
  return (
    <HeatmapCanvas
      page={selectedPage}
      points={filteredPoints}  // ← drawHeatmapLayer 함수에 전달
    />
  )
}
```

---

## 📊 원본 이미지 크기 vs 화면상 렌더링 크기

```
원본 이미지: 1200x900px
화면 렌더링: 960x720px (80% 축소)

좌표 (0.5, 0.5) = 중앙
  ↓
xRatio = 0.5, yRatio = 0.5
  ↓
left = 0.5 * 960 = 480px
top = 0.5 * 720 = 360px
  ↓
Canvas에 원 그리기: arc(480, 360, radius, 0, Math.PI * 2)
```

**ResizeObserver**로 동적 추적되므로, 화면 크기가 변해도 자동으로 재계산됨!

---

## 💡 옅고 은은한 효과 달성 방법

1. **baseAlpha = 0.18**: 기본 투명도를 매우 낮게 설정
   - 하나의 원도 거의 보이지 않음 (의도적)
   - 여러 원이 겹칠 때 비로소 강조됨

2. **반지름 30~50px**: 작고 정밀한 포인트
   - 각 에러가 독립적으로 시각화
   - 겹쳐도 개별 위치를 구분할 수 있음

3. **그래디언트 4단계**: 부드러운 페이드 아웃
   - 중심에서 외곽으로 갈수록 투명도 급격히 감소
   - 가장자리에서 자연스럽게 사라짐

4. **색상 구분**: severity별 색상 차이
   - CRITICAL (빨강) → HIGH (주황) → MEDIUM (노랑) → LOW (녹색)
   - 심각도를 한눈에 파악 가능

---

## ✅ 테스트 체크리스트

- [ ] Mock 이미지 `/mock-images/heatmap-1.png`, `heatmap-2.png` 준비
- [ ] Mock 데이터 파일 `/src/services/result/mock-heatmap-data.ts` 생성
- [ ] ResultHeatmapPage.tsx 업데이트 완료
- [ ] 페이지 로드 시 히트맵이 옅고 은은하게 렌더링됨
- [ ] 각 원형 히트맵이 개별적으로 보임
- [ ] 겹친 영역에서 색상이 강해짐 (누적 효과)
- [ ] 필터(ageGroup) 적용 시 포인트 수 변함
- [ ] 페이지 선택 시 다른 스크린샷과 데이터로 전환

---

## 🎯 예상 결과

```
화면:
┌─────────────────────────────────┐
│ [메인 페이지] [상품 상세]        │
├─────────────────────────────────┤
│                                 │
│    원본 스크린샷                 │
│    (여러 개의 옅은 원이 찍혀있음)│
│                                 │
│ 필터: [전체] [20대] [30대] ... │
│                                 │
│ 오류 포인트 목록                 │
└─────────────────────────────────┘

특징:
✓ 각 원이 30~50px 정도 크기
✓ 매우 투명해서 스크린샷이 보임
✓ 겹친 곳만 약간 더 짙어짐
✓ 색상이 심각도 반영 (빨강/주황/노랑/녹색)
✓ 부드러운 그래디언트로 부자연스럽지 않음
```
