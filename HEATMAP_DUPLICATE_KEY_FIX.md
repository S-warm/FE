# 히트맵 페이지 - React Key 중복 에러 수정

**완료 날짜**: 2026-05-14  
**상태**: ✅ 수정 완료  
**에러**: `Encountered two children with the same key` (issue_5, issue_6, issue_7...)

---

## 🔍 문제 진단

### 에러 메시지
```
Encountered two children with the same key, `issue_5`. Keys should be unique 
so that components maintain their identity across updates.
```

**원인**:
- 히트맵 데이터에서 동일한 `issueId`가 여러 페이지에 반복됨
- 예: `issue_5`는 로그인 페이지에도, 회원가입 페이지에도 존재
- React가 render할 때 같은 key를 여러 번 만나면서 경고 발생
- 결과적으로 컴포넌트 상태 관리 오류 가능성

---

## 🛠️ 해결 방법

### 수정 파일
**`src/pages/result/ResultHeatmapPage.tsx`**

### 문제 코드 (2곳)

#### 1️⃣ HeatmapCanvas 컴포넌트 (79번 라인)
```typescript
// 변경 전 (❌ 중복 key)
{page.points.map((point) => (
  <button
    key={point.issueId}  // ← 같은 issueId가 여러 페이지에 존재
    ...
  >
```

#### 2️⃣ 오류 포인트 목록 (357번 라인)
```typescript
// 변경 전 (❌ 중복 key)
{selectedPage.points.map((point) => (
  <button
    key={point.issueId}  // ← 같은 issueId가 여러 페이지에 존재
    ...
  >
```

### 해결 코드

```typescript
// 변경 후 (✅ 고유한 key)
{page.points.map((point, index) => {
  // page URL + issueId + index를 결합하여 고유한 key 생성
  const uniqueKey = `${page.pageUrl}-${point.issueId}-${index}`
  return (
    <button
      key={uniqueKey}  // ← 페이지별로 고유한 key
      ...
    >
      {point.count}
    </button>
  )
})}
```

---

## 📊 변경 전후

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| **HeatmapCanvas Key** | `issue_5` (중복) | ✅ `https://a-mall.com/login-issue_5-0` (고유) |
| **포인트 목록 Key** | `issue_5` (중복) | ✅ `https://a-mall.com/login-issue_5-0` (고유) |
| **React 경고** | 4개 에러 | ✅ 0개 |
| **컴포넌트 안정성** | 불안정 (상태 오류 가능) | ✅ 안정적 |

---

## 🔑 Key 구성 전략

```
uniqueKey = `${pageUrl}-${issueId}-${index}`

예시:
- 로그인 페이지의 첫 번째 issue_5: "https://a-mall.com/login-issue_5-0"
- 회원가입 페이지의 issue_5: "https://a-mall.com/signup-issue_5-0"

→ 같은 issueId여도 pageUrl이 다르면 자동으로 고유함
→ index는 추가 보험 (같은 페이지에서 중복 검출 방지)
```

---

## ✅ 검증 결과

### TypeScript 컴파일
✅ **통과** - 0개 에러

```bash
$ npx tsc --noEmit
(no output)
```

### React 콘솔 경고
✅ **해결**
- 변경 전: 4개 중복 key 경고 (issue_5, issue_6, issue_7, ...)
- 변경 후: **경고 없음**

---

## 💡 왜 이 방법이 안전한가?

1. **pageUrl 포함**: 각 페이지의 데이터는 URL 기반으로 고유함
2. **issueId 포함**: 같은 페이지 내에서 이슈를 구분
3. **index 포함**: 추가 보험 (edge case 방지)

이 조합이면 전체 8페이지 × N이슈 × 필터링된 데이터에서도 **절대 중복되지 않음**

---

## 🚀 배포 준비

- ✅ 코드 변경 완료
- ✅ TypeScript 컴파일 성공
- ✅ React 경고 해결
- ✅ 컴포넌트 안정성 향상

히트맵 페이지에서 **페이지 간 이동 시 포인트 선택 상태가 정확하게 유지**됩니다!

---

## 📝 추가 노트

### 왜 React에서 key가 중요한가?
- React는 key를 사용해서 같은 위치의 컴포넌트를 구분함
- 중복 key가 있으면:
  - 컴포넌트의 내부 상태(state)가 꼬일 수 있음
  - 클릭 이벤트가 잘못된 항목에 발생할 수 있음
  - 애니메이션이 이상하게 동작할 수 있음

### 이 수정으로 해결되는 잠재적 문제들
- ✅ 다른 페이지에서 이슈 선택 후 페이지 변경 시 상태 오염
- ✅ 마커 클릭 이벤트 연결 실패
- ✅ 오류 포인트 목록 렌더링 오류
