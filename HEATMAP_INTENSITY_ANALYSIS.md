# 🔥 히트맵 열선 강도 분석

**분석 날짜**: 2026-05-25  
**이슈**: 에러 포인트가 적을 때(3-4개) 열선 강도가 과도하게 높음

---

## 📊 **현재 강도 계산 로직**

### Step 1: 포인트 강도 계산 (라인 248-257)

```typescript
function getSeverityWeight(point: ResultHeatmapPointViewModel) {
  const rank = point.severity?.rank ?? 0
  if (rank >= 4) return 1.5      // CRITICAL
  if (rank >= 2) return 1.0      // HIGH, MEDIUM
  return 0.6                      // LOW
}

function getPointIntensity(point: ResultHeatmapPointViewModel) {
  return point.count * getSeverityWeight(point)
}
```

### Step 2: 샘플 크기별 가시성 프로필 (라인 95-143)

```typescript
function getLowSampleVisibilityProfile(pointsCount: number) {
  if (pointsCount <= 4) {
    return {
      intensityBoost: 1.6,        // ⚠️ 매우 높음!
      intensityFloor: 0.4,
      coreAlphaBonus: 0.12,
      ambientAlphaBonus: 0.1,
      alphaThreshold: 3,
    }
  }

  if (pointsCount <= 8) {
    return {
      intensityBoost: 1.44,
      intensityFloor: 0.34,
      coreAlphaBonus: 0.09,
      ambientAlphaBonus: 0.08,
      alphaThreshold: 3,
    }
  }

  if (pointsCount <= 12) {
    return {
      intensityBoost: 1.3,
      intensityFloor: 0.28,
      coreAlphaBonus: 0.07,
      ambientAlphaBonus: 0.06,
      alphaThreshold: 4,
    }
  }

  if (pointsCount <= 24) {
    return {
      intensityBoost: 1.18,  // BLOB_HEATMAP_LOW_SAMPLE_BOOST
      intensityFloor: 0.22,
      coreAlphaBonus: 0.04,
      ambientAlphaBonus: 0.04,
      alphaThreshold: 4,
    }
  }

  // 25개 이상
  return {
    intensityBoost: 1.0,      // ← 강도 정상
    intensityFloor: 0,
    coreAlphaBonus: 0,
    ambientAlphaBonus: 0,
    alphaThreshold: Math.max(4, Math.round(9 / getDevicePixelRatio())),
  }
}
```

### Step 3: 정규화 및 강도 적용 (라인 346-366)

```typescript
const intensities = points.map(getPointIntensity)
const maxIntensity = Math.max(...intensities, 1)
const visibilityProfile = getLowSampleVisibilityProfile(points.length)

for (let index = 0; index < points.length; index += 1) {
  const normalized = intensities[index] / maxIntensity
  const softened = clampUnit(
    Math.max(
      visibilityProfile.intensityFloor,
      Math.pow(normalized, 0.88) * visibilityProfile.intensityBoost,
    ),
  )
  // softened 값이 최종 강도로 사용됨
}
```

---

## 🔴 **문제 분석**

### 사용자 데이터 (프로덕션)

**페이지 1** (category.html):
```json
{
  "totalErrorCount": 3,
  "errorPoints": [
    { "count": 1, "severity": "LOW" },
    { "count": 2, "severity": "LOW" },
    { "count": 1, "severity": "LOW" }
  ]
}
```

**페이지 2** (detail-1.html):
```json
{
  "totalErrorCount": 4,
  "errorPoints": [
    { "count": 1, "severity": "LOW" },
    { "count": 1, "severity": "LOW" },
    { "count": 1, "severity": "LOW" },
    { "count": 1, "severity": "LOW" }
  ]
}
```

### 강도 계산 예시 (페이지 2)

```
pointsCount: 4 → pointsCount <= 4 범주
visibilityProfile: { intensityBoost: 1.6, intensityFloor: 0.4, ... }

각 포인트:
  - count: 1, severity: "LOW" (rank 1)
  - getSeverityWeight: 0.6
  - intensity: 1 * 0.6 = 0.6

maxIntensity: 0.6 (모든 포인트 동일)

normalized: 0.6 / 0.6 = 1.0

softened = max(0.4, pow(1.0, 0.88) * 1.6)
        = max(0.4, 1.0 * 1.6)
        = 1.6  ← ⚠️ 최대값!
```

### 반경 및 알파 계산

```typescript
const radius = baseRadius * (0.9 + density * 0.18 + softened * 0.06)
            = baseRadius * (0.9 + 0~0.2 + 1.6*0.06)
            = baseRadius * (0.9 + 0.1 + 0.096)
            = baseRadius * 1.0~1.1  ← 매우 큼

const ambientAlpha = min(0.32, 0.1 + 1.6 * (0.28 + 0~0.05))
                   = min(0.32, 0.1 + 1.6 * 0.28~0.33)
                   = min(0.32, 0.1 + 0.448~0.528)
                   = min(0.32, 0.548~0.628)
                   = 0.32  ← capped to max, still high
```

**결과**: 반경과 알파가 모두 매우 높음 → **과도한 강도**

---

## 💡 **로컬 버전 (2번째 사진)이 약한 이유**

로컬에서는 아마도:
- pointsCount가 더 많거나 (> 24)
- intensityBoost가 더 낮거나 (1.0)
- 데이터의 maxIntensity가 더 높거나

결과적으로 normalized 값이 더 낮아져 softened가 약해집니다.

---

## 🎯 **해결 방안**

### 문제의 근본 원인
**pointsCount가 4개 이하일 때 intensityBoost: 1.6은 너무 높다**

이는 "매우 적은 샘플이 있을 때 가시성을 높이기 위한" 의도이지만,
현재 프로덕션 데이터의 특성(포인트 3-4개, count 1-2, 모두 LOW severity)에는 과도합니다.

### 솔루션 1: 새로운 프로필 추가 (권장)

```typescript
function getLowSampleVisibilityProfile(pointsCount: number) {
  // 🆕 초저샘플: 1-2개 포인트
  if (pointsCount <= 2) {
    return {
      intensityBoost: 1.2,      // 낮춤
      intensityFloor: 0.3,
      coreAlphaBonus: 0.08,
      ambientAlphaBonus: 0.06,
      alphaThreshold: 3,
    }
  }

  // 🆕 저샘플: 3-4개 포인트 (현재 상황)
  if (pointsCount <= 4) {
    return {
      intensityBoost: 1.1,      // 1.6 → 1.1로 낮춤 ⬇️
      intensityFloor: 0.25,     // 0.4 → 0.25로 낮춤
      coreAlphaBonus: 0.08,     // 0.12 → 0.08로 낮춤
      ambientAlphaBonus: 0.06,  // 0.1 → 0.06으로 낮춤
      alphaThreshold: 3,
    }
  }

  // 기존 프로필들 유지...
  if (pointsCount <= 8) {
    return {
      intensityBoost: 1.44,
      intensityFloor: 0.34,
      coreAlphaBonus: 0.09,
      ambientAlphaBonus: 0.08,
      alphaThreshold: 3,
    }
  }
  // ... 나머지
}
```

### 솔루션 2: 동적 정규화 (선택사항)

```typescript
function getPointIntensity(point: ResultHeatmapPointViewModel) {
  const baseIntensity = point.count * getSeverityWeight(point)
  
  // 매우 낮은 intensity는 floor 값으로 보정
  if (baseIntensity < 0.5) {
    return baseIntensity * 1.2  // 약간 부스트
  }
  
  return baseIntensity
}
```

---

## 📈 **비교**

### 현재 (intensityBoost: 1.6)

```
포인트 4개, 모두 (count:1, severity:LOW)
↓
intensity: 0.6, maxIntensity: 0.6
↓
normalized: 1.0
↓
softened: max(0.4, 1.0 * 1.6) = 1.6
↓
radius: 100 * (0.9 + 0.1 + 0.096) = 100 ~ 110px
↓
매우 강한 열선 ❌
```

### 제안 (intensityBoost: 1.1)

```
포인트 4개, 모두 (count:1, severity:LOW)
↓
intensity: 0.6, maxIntensity: 0.6
↓
normalized: 1.0
↓
softened: max(0.25, 1.0 * 1.1) = 1.1
↓
radius: 100 * (0.9 + 0.1 + 0.066) = 100 ~ 106px
↓
적절한 수준의 열선 ✅
```

---

## ✅ **권장 사항**

**솔루션 1 (새 프로필 추가) 적용**:
1. pointsCount <= 4 구간의 intensityBoost를 1.6 → 1.1으로 조정
2. intensityFloor를 0.4 → 0.25로 조정
3. 두 alpha 값들을 10~20% 감소

이렇게 하면 로컬 버전과 유사한 강도를 얻을 수 있습니다.

