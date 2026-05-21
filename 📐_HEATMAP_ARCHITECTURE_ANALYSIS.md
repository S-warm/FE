# 📐 히트맵 아키텍처 상세 분석

**작성일**: 2026년 5월 21일  
**파일**: `/src/pages/result/ResultHeatmapPage.tsx`  
**목적**: 히트맵의 마커 위치 계산, 스크린샷 크기 처리, 렌더링 로직 분석

---

## 🏗️ 전체 구조

```
┌─────────────────────────────────────────────────┐
│ ResultHeatmapPage (메인 페이지)                  │
├─────────────────────────────────────────────────┤
│ 1. HeatmapCanvas (캔버스 + 마커 렌더링)          │
│    ├─ 원본 이미지 렌더링                        │
│    ├─ Canvas 히트맵 레이어 (그라데이션)         │
│    └─ 마커 오버레이 (포인트 버튼)               │
│                                                 │
│ 2. PointDetail (선택된 포인트 상세 정보)        │
│                                                 │
│ 3. MarkerTooltip (호버 시 팝업)                 │
└─────────────────────────────────────────────────┘
```

---

## 📏 이미지 메트릭 시스템

### 1. RenderedImageMetrics 인터페이스
```typescript
interface RenderedImageMetrics {
  displayWidth: number      // 렌더링된 이미지의 화면상 너비 (px)
  displayHeight: number     // 렌더링된 이미지의 화면상 높이 (px)
  naturalWidth: number      // 원본 이미지의 실제 너비 (px)
  naturalHeight: number     // 원본 이미지의 실제 높이 (px)
}
```

### 2. 메트릭 수집 방식

#### 초기 로드 (onLoad 이벤트):
```typescript
const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget
  setImageMetrics({
    displayWidth: image.clientWidth,      // DOM의 렌더링 크기
    displayHeight: image.clientHeight,    // DOM의 렌더링 크기
    naturalWidth: image.naturalWidth,     // 원본 이미지 크기
    naturalHeight: image.naturalHeight,   // 원본 이미지 크기
  })
}
```

#### 동적 업데이트 (ResizeObserver):
```typescript
useEffect(() => {
  const updateMetrics = () => {
    const image = imageRef.current
    if (!image) return
    
    setImageMetrics({
      displayWidth: image.clientWidth,    // 리사이즈 시 업데이트
      displayHeight: image.clientHeight,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    })
  }

  // 초기 업데이트
  updateMetrics()

  // ResizeObserver로 동적 감시
  const resizeObserver = new ResizeObserver(() => {
    updateMetrics()
  })
  resizeObserver.observe(image)

  return () => resizeObserver.disconnect()
}, [page.pageId])
```

**핵심**: 이미지가 리사이즈되면 자동으로 메트릭 업데이트 ✅

---

## 🎯 마커 위치 계산 (좌표 변환)

### 1. 좌표 모드 (4가지)

```typescript
type ResultHeatmapCoordinateMode =
  | "ratio"                    // 0.0~1.0 정규화 좌표
  | "percent"                  // 0~100 퍼센트 좌표
  | "pixel"                    // 실제 픽셀 좌표 (원본 기준)
  | "pixel-scaled-thousand"    // 픽셀 좌표 (1000 스케일)
```

### 2. 좌표 변환 로직

#### resolvePointRatios 함수:
```typescript
function resolvePointRatios(
  point: Pick<ResultHeatmapPointViewModel, "x" | "y">,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
) {
  const { x, y } = point

  // Mode 1: Ratio (0.0~1.0)
  if (coordinateMode === "ratio") {
    return {
      xRatio: clampRatio(x),           // x가 이미 0~1 범위
      yRatio: clampRatio(y),
    }
  }

  // Mode 2: Percent (0~100)
  if (coordinateMode === "percent") {
    return {
      xRatio: clampRatio(x / 100),     // x를 100으로 나누어 정규화
      yRatio: clampRatio(y / 100),
    }
  }

  // Mode 3: Pixel-Scaled-Thousand (픽셀 좌표 / 1000)
  if (coordinateMode === "pixel-scaled-thousand" &&
      metrics.naturalWidth > 0 && metrics.naturalHeight > 0) {
    return {
      xRatio: clampRatio((x * 1000) / metrics.naturalWidth),    // 1000 스케일
      yRatio: clampRatio((y * 1000) / metrics.naturalHeight),
    }
  }

  // Mode 4: Pixel (실제 픽셀 좌표)
  if (coordinateMode === "pixel" &&
      metrics.naturalWidth > 0 && metrics.naturalHeight > 0) {
    return {
      xRatio: clampRatio(x / metrics.naturalWidth),   // 원본 크기로 정규화
      yRatio: clampRatio(y / metrics.naturalHeight),
    }
  }

  return { xRatio: 0, yRatio: 0 }
}
```

#### resolvePointPixels 함수:
```typescript
function resolvePointPixels(
  point: Pick<ResultHeatmapPointViewModel, "x" | "y">,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
) {
  // 1단계: 비율로 변환
  const { xRatio, yRatio } = resolvePointRatios(point, metrics, coordinateMode)

  // 2단계: 화면 픽셀로 변환 (0~1 비율 → 화면 px)
  return {
    xRatio,
    yRatio,
    left: xRatio * metrics.displayWidth,      // 화면상 X 위치 (px)
    top: yRatio * metrics.displayHeight,      // 화면상 Y 위치 (px)
  }
}
```

### 3. 좌표 변환 예시

```
예: 1920x1440 원본, 960x720 화면 (50% 축소)

Case 1: Ratio 좌표 (0.5, 0.5) = 중앙
└─ xRatio = 0.5, yRatio = 0.5
└─ left = 0.5 * 960 = 480px
└─ top = 0.5 * 720 = 360px ✅

Case 2: Percent 좌표 (50, 50) = 중앙
└─ xRatio = 50/100 = 0.5, yRatio = 50/100 = 0.5
└─ left = 480px, top = 360px ✅

Case 3: Pixel 좌표 (960, 720) = 원본 중앙
└─ xRatio = 960/1920 = 0.5, yRatio = 720/1440 = 0.5
└─ left = 480px, top = 360px ✅

Case 4: Pixel-Scaled-Thousand 좌표 (500, 500)
└─ xRatio = (500 * 1000) / 1920 ≈ 0.26
└─ left ≈ 250px, top ≈ 187px ✅
```

---

## 🎨 히트맵 열지도 렌더링 (Canvas)

### drawHeatmapLayer 함수

```typescript
function drawHeatmapLayer(
  canvas: HTMLCanvasElement,
  metrics: RenderedImageMetrics,
  coordinateMode: ResultHeatmapCoordinateMode,
  points: ResultHeatmapPointViewModel[],
) {
  // 1. Canvas 크기 설정 (DPI 고려)
  const { displayWidth: width, displayHeight: height } = metrics
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.round(width * dpr))      // 고DPI 대응
  canvas.height = Math.max(1, Math.round(height * dpr))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  // 2. Canvas 컨텍스트 설정
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)     // DPI 변환 적용
  ctx.clearRect(0, 0, width, height)         // 이전 드로우 제거

  // 3. 최대 count 값 구하기 (색상 및 크기 스케일링 기준)
  const maxCount = Math.max(...points.map((point) => point.count), 1)

  // 4. 각 포인트마다 히트 원 그리기
  points.forEach((point) => {
    // 4-1. 화면 위치 계산
    const { left: x, top: y } = resolvePointPixels(point, metrics, coordinateMode)
    
    // 4-2. 히트 반지름 계산
    const radius = getHeatRadius(point, maxCount)
    //   = 68 + (count/maxCount) * 76 + getSeverityWeight * 28
    //   = 68~172px (count와 severity에 따라)

    // 4-3. 히트 알파값 계산 (투명도)
    const alpha = getHeatAlpha(point, maxCount)
    //   = 0.24 + getHeatScore * 0.5
    //   = 0.24~0.74 (count와 severity에 따라)

    // 4-4. 색상 결정
    const score = getHeatScore(point, maxCount)  // 0~1
    const color = getHeatColor(score)
    //   - score >= 0.72 → Red (239, 68, 68)
    //   - score >= 0.42 → Orange (249, 115, 22)
    //   - score < 0.42  → Green (34, 197, 94)

    // 4-5. 라디얼 그래디언트 생성
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(${color}, ${Math.min(alpha * 1.18, 0.92)})`)
    gradient.addColorStop(0.14, `rgba(${color}, ${Math.min(alpha * 1.02, 0.84)})`)
    gradient.addColorStop(0.34, `rgba(${color}, ${alpha * 0.72})`)
    gradient.addColorStop(0.58, `rgba(${color}, ${alpha * 0.34})`)
    gradient.addColorStop(0.82, `rgba(${color}, ${alpha * 0.1})`)
    gradient.addColorStop(1, `rgba(${color}, 0)`)

    // 4-6. 원 그리기
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  })
}
```

### 색상 결정 로직

```typescript
function getHeatColor(score: number) {
  if (score >= 0.72) return "239, 68, 68"      // 빨강 (critical)
  if (score >= 0.42) return "249, 115, 22"     // 주황 (high)
  return "34, 197, 94"                         // 녹색 (low)
}

function getHeatScore(point, maxCount) {
  const countRatio = point.count / Math.max(maxCount, 1)
  const severityRatio = Math.min(1, getSeverityWeight(point) / 1.5)
  return Math.min(1, countRatio * 0.72 + severityRatio * 0.28)
  //                 72% count기반  +  28% severity기반
}
```

---

## 🔘 마커 렌더링 (클릭 가능 버튼)

### 마커 위치 및 크기

```typescript
// 각 포인트마다 렌더링되는 요소들:

// 1. 흐릿한 배경 원 (blur 효과)
<div
  style={{
    left: `${position.left}px`,
    top: `${position.top}px`,
    width: `${10 + point.count * 2}px`,       // count에 따라 크기 증가
    height: `${10 + point.count * 2}px`,
    transform: "translate(-50%, -50%)",       // 중심 기준 배치
  }}
/>

// 2. 클릭 가능 마커 버튼
<button
  style={{
    left: `${position.left}px`,
    top: `${position.top}px`,
  }}
  className="size-9"                          // 고정 크기 36px
/>
```

### 마커 크기 규칙
```
배경원: 10 + count * 2 px
마커:   9 (36x36px) 고정
중심:   translate(-50%, -50%) 적용

예:
count = 1 → 배경원 12px
count = 5 → 배경원 20px
count = 10 → 배경원 30px
```

---

## 🎭 호버 및 선택 상태

### 마커 상태 변화

```typescript
{isSelected ? "ring-3 ring-white/65" : ""}     // 선택 상태: 3px 링
{isHovered
  ? "scale-110 ring-4 ring-white/90 shadow-2xl"  // 호버: 110% 확대 + 4px 링
  : "hover:scale-105"                            // 일반: 105% 확대 (호버 시)
}
```

### 툴팁 위치 계산

```typescript
function MarkerTooltip({
  point,
  position,  // 마커의 화면상 절대 좌표
}) {
  let left = position.x + 12   // 마커 우측 12px
  let top = position.y - 50    // 마커 상단 50px

  // 뷰포트 경계 체크 및 조정
  if (left + tooltipWidth > viewportWidth - padding) {
    left = position.x - tooltipWidth - 12  // 좌측에 표시
  }
  
  if (top < padding) {
    top = position.y + 12  // 하단에 표시
  }
  // ... 추가 경계 조정
}
```

---

## 📊 데이터 흐름

```
1. useResultHeatmapQuery
   ↓
2. ResultHeatmapPageViewModel[]
   {
     pageId, pageName, screenshotUrl,
     coordinateMode,
     points: ResultHeatmapPointViewModel[]
   }
   ↓
3. HeatmapCanvas
   ├─ 원본 이미지 로드
   │  └─ handleImageLoad → setImageMetrics
   ├─ ResizeObserver
   │  └─ 화면 크기 변화 시 메트릭 업데이트
   ├─ Canvas 히트맵 그리기
   │  └─ drawHeatmapLayer (메트릭 사용)
   └─ 마커 오버레이
      └─ resolvePointPixels (메트릭 사용)
```

---

## 🔧 현재 구성 요약

| 항목 | 값/로직 |
|------|--------|
| **이미지 크기 추적** | ResizeObserver + onLoad |
| **좌표 모드** | 4가지 (ratio, percent, pixel, pixel-scaled-thousand) |
| **마커 크기** | 10 + count * 2 px (배경), 36px (버튼) |
| **히트 반지름** | 68~172px (count + severity 기반) |
| **히트 색상** | Red(72%+), Orange(42-72%), Green(<42%) |
| **마커 위치** | 중심(-50%, -50%) 기준 |
| **호버 효과** | scale-110 + ring-4 + shadow-2xl |
| **DPI 대응** | devicePixelRatio 적용 |

---

## 💡 최적화 포인트

1. **메트릭 계산**: ResizeObserver로 동적 추적 ✅
2. **좌표 변환**: 4가지 모드 지원 ✅
3. **DPI 대응**: Canvas에서 devicePixelRatio 적용 ✅
4. **반응형**: displayWidth/displayHeight로 유연함 ✅
5. **성능**: Canvas 히트맵 + CSS 마커 분리 ✅

---

## 🎯 수정 권장사항

1. **마커 색상 다양화**: 지금은 모든 마커가 같은 색 (검은색)
   - severity/errorType에 따라 색상 변경 가능

2. **히트맵 가독성**: 색상 범위 조정 가능
   - 현재: Red/Orange/Green
   - 대안: 더 세분화된 색상 그래디언트

3. **마커 크기 스케일링**: count * 2 로직 수정 가능
   - 로그 스케일 적용 고려

4. **성능 최적화**: 포인트가 많을 때
   - 클러스터링 고려
   - Canvas 그리기 최적화
