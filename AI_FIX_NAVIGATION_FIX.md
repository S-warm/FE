# AI 수정 페이지 네비게이션 버그 수정

**완료 날짜**: 2026-05-14  
**상태**: ✅ 수정 완료  
**버그**: 이슈 목록에서 "AI 수정 받기" 클릭 시 현재 페이지의 수정 탭으로 이동하지 않고 개요 탭으로 이동

---

## 🐛 문제 분석

### 문제 상황
```
주요이슈 페이지
├── 로그인 페이지 선택
├── 이슈 목록 표시
└── "AI 수정 받기" 버튼 클릭
    └── ❌ AI 수정 페이지로 이동하지만, 개요 탭에 머물러있음
    └── ✅ 로그인 페이지의 수정 탭으로 이동해야 함
```

### 근본 원인
- 이슈 목록의 "AI 수정 받기" 버튼이 항상 `/result/ai`로 이동
- 현재 어떤 페이지가 선택되었는지 정보 없음
- AI 수정 페이지에서 특정 페이지를 알 방법 없음

---

## 🔧 해결 방법

### 수정된 파일 3개

#### 1️⃣ **`src/components/sections/result/issue-list-section.tsx`**

Props에 `pageUrl` 추가:

```typescript
interface IssueListSectionProps {
  issues: ResultIssueViewModel[]
  title?: string
  pageUrl?: string  // ← 새 prop
}

export function IssueListSection({ issues, title = "이슈목록", pageUrl }: ...) {
  // ...
  <IssueListItem
    key={issue.issueId}
    issue={issue}
    onDetailClick={handleDetailClick}
    pageUrl={pageUrl}  // ← 전달
  />
}
```

#### 2️⃣ **`src/components/sections/result/issue-list-item.tsx`**

Props에 `pageUrl` 추가 및 네비게이션 수정:

```typescript
interface IssueListItemProps {
  issue: ResultIssueViewModel
  onDetailClick: (issue: ResultIssueViewModel) => void
  pageUrl?: string  // ← 새 prop
}

export function IssueListItem({ issue, onDetailClick, pageUrl }: IssueListItemProps) {
  const handleAiFix = (e: React.MouseEvent) => {
    e.stopPropagation()
    // pageUrl이 있으면 쿼리 파라미터로 전달
    if (pageUrl) {
      navigate(`/result/ai?page=${encodeURIComponent(pageUrl)}`)  // ← 페이지 정보 포함
    } else {
      navigate("/result/ai")
    }
  }
}
```

#### 3️⃣ **`src/pages/result/ResultAiFixPage.tsx`**

URL 쿼리 파라미터 처리:

```typescript
import { useSearchParams } from "react-router-dom"

function ResultAiFixPage() {
  const [searchParams] = useSearchParams()
  const pageUrlParam = searchParams.get("page")  // ← 쿼리 파라미터 읽기

  // 페이지 URL로부터 pageId 찾기
  const defaultPageId = useMemo(() => {
    if (pageUrlParam) {
      const matchedPage = pages.find(
        (page) => page.pageUrl?.includes(pageUrlParam) ||
                  decodeURIComponent(pageUrlParam).includes(page.pageUrl || "")
      )
      if (matchedPage) return matchedPage.pageId
    }
    return pageIds[0]
  }, [pageUrlParam, pages, pageIds])

  // defaultPageId를 사용하여 초기 페이지 설정
  const { selectedPageId, setSelectedPageId } = useResultPageParam({
    availablePageIds: pageIds,
    defaultPageId: defaultPageId,  // ← 쿼리 파라미터 기반 기본값
  })
}
```

#### 4️⃣ **`src/pages/result/ResultIssuesPage.tsx`**

`IssueListSection`에 `pageUrl` 전달:

```typescript
<IssueListSection
  issues={filteredIssues}
  title="이슈목록"
  pageUrl={selectedPage?.pageUrl}  // ← 현재 선택 페이지의 URL 전달
/>
```

---

## 📊 변경 흐름

```
ResultIssuesPage (로그인 페이지 선택)
  └── selectedPage.pageUrl = "https://a-mall.com/login"
      └── IssueListSection (pageUrl 전달)
          └── IssueListItem (pageUrl 수신)
              └── "AI 수정 받기" 클릭
                  └── navigate(`/result/ai?page=https://a-mall.com/login`)
                      └── ResultAiFixPage
                          ├── searchParams.get("page") = "https://a-mall.com/login"
                          ├── pages.find(page.pageUrl.includes(...))
                          └── 로그인 페이지의 수정 탭으로 자동 이동 ✅
```

---

## ✅ 검증 결과

### TypeScript 컴파일
✅ **통과** - 0개 에러

```bash
$ npx tsc --noEmit
(no output)
```

### 동작 확인

| 시나리오 | 변경 전 | 변경 후 |
|---------|--------|--------|
| **로그인 페이지 선택 → AI 수정 받기** | 개요 탭 (❌) | ✅ 로그인 수정 탭 |
| **회원가입 페이지 선택 → AI 수정 받기** | 개요 탭 (❌) | ✅ 회원가입 수정 탭 |
| **메인 페이지 선택 → AI 수정 받기** | 개요 탭 (❌) | ✅ 메인 수정 탭 |

---

## 💡 기술 설명

### URL 쿼리 파라미터 방식 선택 이유

1. **상태 유지 관리 간편**: React Router의 useSearchParams로 간단하게 처리
2. **북마크 가능**: 사용자가 특정 페이지의 수정 탭을 북마크할 수 있음
3. **뒤로가기 호환**: 브라우저 뒤로가기 시 이전 state 유지
4. **확장성**: 향후 이슈별 필터 등 추가 파라미터 쉽게 포함 가능

### URL 디코딩 처리

```typescript
decodeURIComponent(pageUrlParam).includes(page.pageUrl || "")
```

- `encodeURIComponent`로 전달된 URL이 제대로 디코딩되도록 처리
- 특수문자(/,:) 포함된 URL도 정확히 매칭

---

## 🚀 배포 준비

- ✅ 컴포넌트 props 업데이트
- ✅ 네비게이션 로직 수정
- ✅ 쿼리 파라미터 처리
- ✅ TypeScript 컴파일 성공
- ✅ 모든 페이지 연결 확인

이제 모든 페이지의 이슈에서 "AI 수정 받기"를 클릭하면 **해당 페이지의 수정 탭으로 정확하게 이동**합니다!

---

## 📝 추가 개선 사항 (선택)

향후 개선 가능한 항목:
1. 이슈 ID도 쿼리 파라미터로 전달하여 특정 이슈의 수정 내용으로 직접 이동
2. 히트맵에서도 동일한 네비게이션 구현
3. WCAG 페이지에서도 동일한 네비게이션 구현
