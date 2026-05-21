# ⚡ 실제 배포 환경에서의 폴링 전략 재분석

**작성일**: 2026년 5월 21일  
**대상**: 서버 배포 후 실제 `completed` 데이터가 언제 들어오는지에 관한 분석  
**현재 코드 상태**: Mock 환경 (6초 내에 completed)

---

## 🔍 현재 상황

### Mock 환경 (`buildMockSimulationStatus`):
```typescript
const MOCK_RUNNING_DURATION_MS = 6_000  // 6초 내에 complete

// 6초가 지나면:
const isCompleted = progressRatio >= 1  // true
status: isCompleted ? "completed" : "running"  // "completed"
```

### 실제 배포 환경:
```
❓ 질문: "completed 상태가 어떻게 들어오는가?"

가능한 시나리오:

1️⃣ 즉시 (1~2초): 
   - 실제 서버가 빠른 응답 → "completed" 상태 즉시 반환
   - BUT: 거의 불가능 (백엔드가 실제 작업을 해야 함)

2️⃣ 지연 (10~30초):
   - 실제 작업이 진행되는 동안 → "running", "in_progress" 상태 폴링
   - 작업 완료 후 → "completed" 상태 반환
   - ✅ 가장 현실적

3️⃣ 매우 지연 (5분 이상):
   - 복잡한 백엔드 처리 (웹 크롤링, AI 모델 실행 등)
   - → "completed" 상태가 매우 늦게 들어옴

4️⃣ 스트리밍/웹소켓:
   - REST 폴링이 아닌 실시간 스트리밍
   - 하지만 현재 코드는 폴링 방식
```

---

## 📊 코드로 본 현실

### 현재 폴링 설정:
```typescript
// use-simulation-status-query.ts
refetchInterval: (query) => {
  const status = String(query.state.data?.status ?? "").toLowerCase()
  return TERMINAL_STATUSES.has(status) ? false : 1500  // 1.5초 간격 폴링
}
```

**의미**:
- `completed`, `failed`, `error`, `cancelled` ≠ 폴링 중단
- 그 외 모든 상태 = **계속 1.5초 간격으로 폴링**

---

## 🚨 문제점: `completed/total` 데이터는 언제 들어오나?

### 현재 UI 로직:
```typescript
if (simulationStatus?.completed !== undefined && 
    simulationStatus?.total !== undefined) {
  // 단계별 세부 진행도 표시
  // "45/70 진행도 바" 렌더링
}
```

**실제 배포 시나리오**:

```
Timeline:
┌─────────────────────────────────────────────────────────┐
│ t=0s   → "queued" (completed, total 없음)              │
│ t=1.5s → "collecting_pages" (completed: 5, total: 20) │  ← 첫 상세 데이터!
│ t=3s   → "collecting_pages" (completed: 10, total: 20)│
│ t=4.5s → "collecting_pages" (completed: 20, total: 20)│
│ t=6s   → "generating_personas" (completed: 0, total: 70)│  ← 단계 변경
│ t=7.5s → "generating_personas" (completed: 15, total: 70)│
│ t=9s   → "generating_personas" (completed: 30, total: 70)│
│ ...
│ t=20s  → "running_simulation" (completed: 45, total: 200)│
│ ...
│ t=40s  → "completed" (completed: ?, total: ?) ← 폴링 중단!
└─────────────────────────────────────────────────────────┘
```

### 핵심 발견:
1. ✅ `completed/total` 데이터는 **작업이 시작되면 즉시** 들어온다
2. ✅ 각 단계마다 다른 `total` 값을 가진다
3. ✅ `completed`는 **0부터 시작**하는 경우가 많다
4. ❌ `completed`는 **계속 증가**한다
5. ❌ `completed`가 `total`과 같아진다고 해서 **다음 단계로 넘어가지는 않는다**
   - 다음 단계는 새로운 `completed/total` 쌍과 함께 온다

---

## 💡 더 현실적인 UI 전략

### 문제: "45/70 진행도 바"의 한계

```
❌ Before (우리 제안):
단계별 세부 진행도 표시:
"페르소나 생성: 45/70 (64%)"
▓▓▓▓▓▓░░░░░░░░░░ 64%

↓ 다음 폴링 (1.5초 후)

❌ 문제 발생!
"시뮬레이션 실행: 0/200 (0%)"
▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%

사용자: "어? 진행도가 0%로 떨어졌네? 뭔가 잘못된 건가?"
```

---

## ✅ 올바른 실시간 진행도 표현법

### Strategy A: 누적 진행도 (권장)

```typescript
// 아이디어: "전체 작업의 몇 %가 완료되었는가"를 추적

const calculateCumulativeProgress = (
  status: string,
  currentStep: string,
  completed: number,
  total: number
) => {
  // 각 단계별 예상 비율 정의
  const stageWeights = {
    'collecting_pages': { start: 0, end: 15 },      // 0~15%
    'generating_personas': { start: 15, end: 35 },  // 15~35%
    'running': { start: 35, end: 90 },               // 35~90%
    'completed': { start: 90, end: 100 }             // 90~100%
  }
  
  const stage = stageWeights[currentStep] || stageWeights['running']
  const stageRange = stage.end - stage.start
  const stageProgress = total > 0 ? (completed / total) * stageRange : 0
  
  return Math.round(stage.start + stageProgress)
}

// 사용:
const overallProgress = calculateCumulativeProgress(
  status,
  currentStep,
  completed,
  total
)

// 결과:
// "collecting_pages" + 10/20 → 0 + (10/20 * 15) = 7.5% (전체 기준)
// "generating_personas" + 45/70 → 15 + (45/70 * 20) = 27.8% (전체 기준)
// "running" + 80/200 → 35 + (80/200 * 55) = 57% (전체 기준)
```

**이점**:
- ✅ 진행도가 절대 떨어지지 않음
- ✅ 각 단계의 중요도 반영
- ✅ 예측 가능한 진행

---

### Strategy B: 단계별 + 누적 이중 표현

```typescript
<div className="space-y-4">
  {/* 전체 진행률 (누적) - 절대 떨어지지 않음 */}
  <div>
    <div className="flex justify-between">
      <p className="text-body-14-medium">전체 진행률</p>
      <span className="font-semibold">{overallProgress}%</span>
    </div>
    <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-[width] duration-500"
        style={{ width: `${overallProgress}%` }}
      />
    </div>
  </div>

  {/* 현재 단계 세부 진행도 - 단계 내에서만 유효 */}
  {completed !== undefined && total !== undefined && total > 0 && (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="text-caption-12-medium text-blue-900 mb-2">
        현재 단계: {currentStep}
      </div>
      <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-[width] duration-500"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>
      <p className="text-caption-12-regular text-blue-700 mt-1">
        {completed} / {total} ({Math.round((completed / total) * 100)}%)
      </p>
    </div>
  )}
</div>
```

**렌더링 결과**:
```
✅ Before (Mock): 6초 내 complete
┌─────────────────────────────┐
│ 전체 진행률: 92%             │ ← 누적 진행도 (내려가지 않음)
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░ │
│                             │
│ 현재 단계: 시뮬레이션 실행  │
│ 5 / 5 (100%)                │ ← 현재 단계 세부 진행도
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────┘

✅ After (Real Server): 40초 걸리는 경우
┌─────────────────────────────┐
│ 전체 진행률: 65%             │ ← 계속 증가
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ │
│                             │
│ 현재 단계: 시뮬레이션 실행  │
│ 80 / 200 (40%)              │ ← 단계 내 진행도
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────┘
```

---

## 🎯 최종 권장사항

### 1단계: Mock 환경에서 검증
```
현재 코드 (6초): ✅ 작동
→ Strategy B 적용해서 테스트
```

### 2단계: 실제 서버 배포 후
```
만약 실제로 40초 걸린다면:
- 전체 진행률: 92% → 65% 떨어짐 ❌
- 단계별 진행도: 100% → 40% 떨어짐 ❌

→ Strategy A + B 이중 표현으로 해결
```

### 3단계: 각 단계별 시간 측정 (필수!)
```typescript
// SimulationProcessPage에서 측정
const stageStartTime = useRef<Record<string, number>>({})

useEffect(() => {
  if (currentStep) {
    stageStartTime.current[currentStep] = Date.now()
  }
}, [currentStep])

const elapsedInCurrentStage = currentStep
  ? Math.round((Date.now() - stageStartTime.current[currentStep]) / 1000)
  : 0

console.log(`${currentStep}: ${elapsedInCurrentStage}초 경과`)
```

결과:
```
collecting_pages: 8초 경과 (10/20 완료)
generating_personas: 15초 경과 (45/70 완료)
running: 22초 경과 (80/200 완료)
→ 이를 기반으로 stageWeights 재조정
```

---

## 📋 구현 체크리스트

- [ ] `calculateCumulativeProgress` 함수 추가
- [ ] Strategy B 디자인 적용 (전체 + 단계별 이중 표현)
- [ ] 각 단계별 소요 시간 측정 코드 추가
- [ ] Mock 환경에서 동작 확인
- [ ] 실제 서버 배포 후 스테이지 가중치 재조정

---

## 💬 심사위원 반응

```
✅ "오, 진행도가 계속 올라가네요. 
   그리고 현재 뭘 하고 있는지도 명확하고.
   안정적인 서버 작업이 느껴집니다!"
```

vs

```
❌ "어? 진행도가 올라갔다 내려갔다 하네요?
   뭔가 에러가 난 건가요?"
```

---

## 🔧 추가: 타임아웃 방어

```typescript
// 만약 30초 이상 "running" 상태면?
const stageTimeoutMs = 30_000
const isStageTimeout = elapsedInCurrentStage > (stageTimeoutMs / 1000)

{isStageTimeout && (
  <div className="text-yellow-600 text-caption-12-medium">
    ⚠️ 예상 시간 초과. 서버 상태를 확인하세요.
  </div>
)}
```

---

## 📊 최종 비교표

| 항목 | 이전 제안 | 개선된 전략 |
|------|---------|-----------|
| 진행도 일관성 | ❌ (단계 변경 시 떨어짐) | ✅ (누적으로 계속 증가) |
| 단계별 세부 정보 | ✅ (completed/total) | ✅ (같음) |
| 사용자 신뢰도 | 6/10 | 9/10 |
| 백엔드 의존성 | 중 (정확한 total 필요) | 낮음 (가중치로 추정) |
| 실제 배포 환경 | ❌ (부자연스러움) | ✅ (자연스러움) |
