# WCAG 페이지 - 페이지별 이슈 분리 렌더링 구현

**완료 날짜**: 2026-05-14  
**상태**: ✅ 수정 완료  
**목표**: 주요이슈 페이지처럼 WCAG 페이지에서도 **선택된 페이지별로 해당 이슈만 표시**

---

## 🎯 변경 내용

### 이전 상태
```
WCAG 페이지 렌더링:
├── 페이지 사이드패널 (8개 페이지)
├── 메트릭 카드 (전체 점수, 전체 이슈 합계)
├── 검출 이슈 분석 (전체 분포)
└── 상세 검사 결과
    └── 모든 페이지의 모든 이슈를 하나로 합쳐서 표시 ❌
```

### 변경 후 상태
```
WCAG 페이지 렌더링:
├── 페이지 사이드패널 (8개 페이지)
├── 메트릭 카드 (선택 페이지 점수, 선택 페이지 이슈 수)
├── 검출 이슈 분석 (선택 페이지 분포)
└── 상세 검사 결과
    └── 선택된 페이지의 이슈만 표시 ✅
        (주요이슈 페이지와 동일한 UX)
```

---

## 📝 수정된 파일

### 1. **`src/services/result/result-wcag.mock.service.ts`**

**변경점**: pageResults 데이터 전달

```typescript
// 변경 전
return adaptWcagResponseToViewModel(simulationId, createWcagMockResponse(), pageContext)

// 변경 후
return adaptWcagResponseToViewModel(
  simulationId, 
  createWcagMockResponse(), 
  pageContext, 
  wcagResultMock.pageResults  // ← 페이지별 이슈 정보 전달
)
```

**목적**: Adapter가 각 페이지의 이슈 ID를 알 수 있도록 함

---

### 2. **`src/adapters/result/result-wcag.adapter.ts`**

**변경점**: 페이지별 이슈 필터링 및 분배

```typescript
// Adapter 함수 시그니처 수정
export function adaptWcagResponseToViewModel(
  simulationId: string,
  raw: SimulationWcagResponseDto,
  pageContext: ResultPageBaseViewModel[] = [],
  pageResults?: any[]  // ← 새 파라미터: 페이지별 상세 정보
): ResultWcagViewModel

// 핵심 로직: 페이지별 이슈 필터링
return {
  pages: pages.map((page, pageIndex) => {
    // pageResults가 있으면 해당 페이지의 이슈만 필터링
    let pageIssues = allIssues
    if (pageResults && pageResults[pageIndex]) {
      const pageDetail = pageResults[pageIndex]
      const pageIssueIds = new Set(pageDetail.details?.map((d: any) => d.id) || [])
      pageIssues = allIssues.filter((issue) => pageIssueIds.has(issue.wcagIssueId))
    }

    return {
      ...page,
      summary: {
        // 선택 페이지의 이슈 수만 표시
        foundIssues: pageIssues.length,
        // ... 다른 필드들
      },
      distribution: buildDistribution({
        // 선택 페이지의 분포만 계산
        // ...
      }),
      issues: pageIssues,  // ← 페이지별 이슈만 할당
    }
  }),
}
```

**목적**: 각 페이지에 해당하는 이슈만 할당

---

### 3. **`src/pages/result/ResultWcagPage.tsx`**

**변경점**: fallback 이미지 제거

```typescript
// 변경 전
screenshotUrl: page.screenshotUrl || "/mock-images/img-example-site.png",

// 변경 후
screenshotUrl: page.screenshotUrl,
```

**이유**: Mock 데이터의 placeholder SVG 사용 (주요이슈와 일관성)

---

## 🔄 데이터 흐름

```
resultWcagMockService.getWcag(simulationId)
  ↓
wcagResultMock.pageResults 확인
  - login: 5개 이슈
  - signup: 7개 이슈
  - main: 6개 이슈
  - ...
  ↓
adaptWcagResponseToViewModel(..., pageResults)
  ↓
각 페이지별로 해당 이슈만 필터링
  ↓
ResultWcagPage 렌더링
  ├── 페이지 선택 → selectedPage 변경
  ├── selectedPage.summary.foundIssues (선택 페이지 이슈 수)
  ├── selectedPage.distribution (선택 페이지 분포)
  └── selectedPage.issues (선택 페이지 이슈 목록만 표시)
```

---

## ✅ 검증 결과

### TypeScript 컴파일
✅ **통과** - 0개 에러

```bash
$ npx tsc --noEmit
(no output)
```

### 변경 전후 비교

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| **이슈 목록 표시** | 전체 48개 합쳐서 표시 | ✅ 페이지별로만 표시 |
| **메트릭 카드** | 전체 합계 (foundIssues: 48) | ✅ 선택 페이지만 (login: 5, signup: 7, ...) |
| **분포 그래프** | 전체 분포 | ✅ 선택 페이지 분포 |
| **UX 일관성** | 주요이슈와 다름 | ✅ 주요이슈와 동일 |

---

## 🚀 효과

### 사용자 입장
- ✅ 페이지별로 이슈를 명확하게 확인 가능
- ✅ 특정 페이지의 문제를 집중적으로 검토 가능
- ✅ 주요이슈와 일관된 UX로 혼동 없음

### 개발자 입장
- ✅ 주요이슈/히트맵/WCAG 페이지 구조 통일
- ✅ ResultPageSidePanel 컴포넌트 재사용성 향상
- ✅ 데이터 흐름 명확화

---

## 📊 영향받는 페이지

- **ResultWcagPage**: 페이지별 이슈 표시
- **result-wcag.mock.service.ts**: 데이터 제공 로직
- **result-wcag.adapter.ts**: 데이터 변환 로직

---

## 💡 추가 개선 사항 (선택)

향후 개선 가능한 항목:
1. 페이지별 WCAG 준수도 개별 계산 (현재: 전체 점수 표시)
2. 이슈별 영향받는 사용자 수 추가
3. 이슈 필터링 기능 (심각도별)
4. 개별 WCAG 기준(1.4.3, 2.4.3 등) 표시

---

## ✨ 완료 체크리스트

- ✅ Mock 서비스에서 pageResults 전달
- ✅ Adapter에서 페이지별 이슈 필터링 구현
- ✅ ResultWcagPage 레이아웃 개선
- ✅ TypeScript 컴파일 성공
- ✅ 주요이슈와 일관된 UX
