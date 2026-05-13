# 이슈 상세보기 모달 컴포넌트

주요 이슈 페이지에서 이슈 목록의 각 항목을 클릭하면 우측 사이드 패널에서 상세 정보를 확인할 수 있는 컴포넌트입니다.

## 📦 컴포넌트 구조

### 1. `IssueListSection`
- **역할**: 이슈 목록을 관리하는 컨테이너
- **책임**: 모달 상태 관리, 이슈 선택 처리
- **Props**:
  - `issues`: IssueDetailViewModel[] - 이슈 목록
  - `title`: string (선택) - 섹션 제목

```tsx
<IssueListSection 
  issues={mockIssueDetailData} 
  title="주요 이슈" 
/>
```

### 2. `IssueListItem`
- **역할**: 개별 이슈 카드 표시
- **특징**: 
  - 호버 시 "상세보기" 버튼 표시
  - 심각도별 배지 색상
  - 주요 통계(발생건수, 발생률) 표시

```tsx
<IssueListItem 
  issue={issue}
  onDetailClick={(issue) => handleClick(issue)}
/>
```

### 3. `IssueDetailModal`
- **역할**: 우측 사이드 모달 UI 렌더링
- **특징**:
  - 부드러운 슬라이드인 애니메이션 (300ms)
  - 배경 오버레이 (클릭 시 닫힘)
  - 다크모드 지원
  - 모바일 반응형 (45% 너비)

```tsx
<IssueDetailModal 
  isOpen={isModalOpen}
  issue={selectedIssue}
  onClose={() => setIsModalOpen(false)}
/>
```

## 📋 데이터 타입

### IssueDetailViewModel

```typescript
interface IssueDetailViewModel {
  url: string                      // 이슈 발생 URL
  category: string                 // 카테고리 (사용성, 접근성 등)
  subCategory: string              // 서브카테고리
  severity: "high" | "medium" | "low"  // 심각도
  title: string                    // 이슈 제목
  description: string              // 상세 설명
  targetHtml: string               // 대상 HTML 요소
  tags: string[]                   // 태그 목록
  fail_count: number               // 발생 건수
  fail_rate: number                // 발생률 (0~1)
  session_ids: string[]            // 세션 ID 목록
  persona_ages: string[]           // 페르소나 나이 목록
  affected_personas: AffectedPersona[]  // 영향받은 페르소나 상세
}

interface AffectedPersona {
  session_id: string               // 세션 ID
  persona_age: string              // 페르소나 나이 (예: "70s")
}
```

## 🎨 UI 구성

### 모달 헤더
- 심각도 배지
- 카테고리/서브카테고리
- 이슈 제목
- 닫기 버튼 (X)

### 모달 콘텐츠

#### 1. 개요 섹션 (Overview)
- 카테고리/서브카테고리
- 설명
- 대상 HTML 요소
- 태그

#### 2. 페르소나별 분석 섹션 (Persona Analysis) ⭐ 우선순위 1
- 페르소나별 발생 건수
- 프로그레스바로 비율 시각화
- 색상: 심각도별 구분

```
70s: 18건 (100%)  ████████████████████
```

#### 3. 발생 통계 섹션 (Occurrence Stats) ⭐ 우선순위 2
- 총 발생 건수 (bold)
- 발생률 (%)
- 2컬럼 레이아웃

#### 4. 세션 정보 섹션 (Session Info)
- 세션 ID 목록
- 각 세션의 페르소나 나이
- 최대 높이 제한 + 스크롤

#### 5. URL 정보
- 하이퍼링크로 표시
- 새 탭에서 열기

## 🎬 애니메이션

### 모달 진입 (Open)
```
상태: isAnimating = true
- 모달: translate-x-0 (300ms)
- 배경: opacity-100 (300ms)
- 이징: ease-out
```

### 모달 종료 (Close)
```
상태: isAnimating = false
- 모달: translate-x-full (300ms)
- 배경: opacity-0 (300ms)
- 이징: ease-out
```

## 🎯 사용 예제

### 기본 사용법

```tsx
import { IssueListSection } from "@/components/sections"
import { mockIssueDetailData } from "@/mocks/issue-detail.mock"

function MyPage() {
  return (
    <div className="p-6">
      <IssueListSection 
        issues={mockIssueDetailData}
        title="식별된 주요 이슈"
      />
    </div>
  )
}
```

### API 데이터와 함께 사용

```tsx
function IssueResultPage() {
  const [issues, setIssues] = useState<IssueDetailViewModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // API 호출
    fetchIssues().then(data => {
      setIssues(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>로딩 중...</div>

  return (
    <IssueListSection 
      issues={issues}
      title="시뮬레이션 결과 - 주요 이슈"
    />
  )
}
```

## 🔌 API 연동

### 데이터 변환 (API Response → ViewModel)

```typescript
// API 응답
interface IssueAPIResponse {
  url: string
  category: string
  subCategory: string
  severity: string
  title: string
  // ... 기타 필드
}

// 변환 함수
function mapToViewModel(apiData: IssueAPIResponse): IssueDetailViewModel {
  return {
    ...apiData,
    severity: apiData.severity.toLowerCase() as "high" | "medium" | "low",
    fail_rate: apiData.fail_rate / 100, // 퍼센트 → 소수로 변환
  }
}
```

## 📱 반응형 설계

### 데스크톱 (> 1024px)
- 모달 너비: 45% (max-width 기준)
- 콘텐츠: 풀 스크롤

### 태블릿 (768px ~ 1024px)
- 모달 너비: 50%

### 모바일 (< 768px)
- 모달 너비: 100% (전체 화면)
- 콘텐츠: 스크롤

```tsx
// 반응형 조정 방법
className={cn(
  "fixed right-0 top-0 h-full w-full",
  "max-w-[45%]",           // 데스크톱
  "lg:max-w-[50%]",        // 태블릿
  "md:max-w-full",         // 모바일
)}
```

## 🎨 스타일 커스터마이징

### 심각도별 색상

```typescript
const severityColors = {
  high: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 dark:bg-red-900",
  },
  medium: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    badge: "bg-yellow-100 dark:bg-yellow-900",
  },
  low: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    badge: "bg-green-100 dark:bg-green-900",
  },
}
```

### 색상 변경 예제

```tsx
// 커스텀 색상 적용
const myColors = {
  high: "bg-orange-50 text-orange-700",
  medium: "bg-blue-50 text-blue-700",
  low: "bg-purple-50 text-purple-700",
}
```

## ⚙️ 성능 최적화

### Memoization (선택사항)

```tsx
import { memo } from "react"

export const IssueListItem = memo(function IssueListItem({ issue, onDetailClick }: IssueListItemProps) {
  // ...
}, (prevProps, nextProps) => {
  return (
    prevProps.issue.url === nextProps.issue.url &&
    prevProps.issue.title === nextProps.issue.title
  )
})
```

### 가상 스크롤 (대용량 목록)

```tsx
// 1000개 이상의 이슈가 있는 경우
import { FixedSizeList } from "react-window"

<FixedSizeList
  height={600}
  itemCount={issues.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <IssueListItem issue={issues[index]} />
    </div>
  )}
</FixedSizeList>
```

## 🧪 테스트

### Mock 데이터

```typescript
import { mockIssueDetailData } from "@/mocks/issue-detail.mock"

// 테스트
render(<IssueListSection issues={mockIssueDetailData} />)
```

### 단위 테스트 예제

```typescript
import { render, screen, fireEvent } from "@testing-library/react"
import { IssueListItem } from "./issue-list-item"

describe("IssueListItem", () => {
  it("should show detail button on hover", () => {
    const mockIssue = mockIssueDetailData[0]
    const handleClick = jest.fn()

    render(
      <IssueListItem 
        issue={mockIssue}
        onDetailClick={handleClick}
      />
    )

    const button = screen.getByRole("button", { name: /상세보기/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledWith(mockIssue)
  })
})
```

## 🐛 문제 해결

### Q: 모달이 안 보여요
**A:** 
- `z-50` 클래스가 적용되었는지 확인
- 부모 요소에 `overflow: hidden`이 있는지 확인
- 브라우저 개발자도구에서 z-index 확인

### Q: 애니메이션이 끊겨요
**A:**
- GPU 가속 활성화: `will-change: transform` 추가
- `transition-transform duration-300` 확인

### Q: 모바일에서 너무 작아요
**A:**
- max-w 값을 100%로 조정
- 폰트 크기 조정 (text-sm → text-base)

## 📚 관련 파일

```
src/
├── components/
│   └── sections/
│       ├── result/
│       │   ├── index.ts
│       │   ├── issue-detail-modal.tsx
│       │   ├── issue-list-item.tsx
│       │   ├── issue-list-section.tsx
│       │   ├── issue-detail-demo.tsx
│       │   └── README.md (이 파일)
│       └── index.ts
├── types/
│   └── view-model/
│       └── result/
│           └── issue-detail.ts
└── mocks/
    └── issue-detail.mock.ts
```

## 🔄 버전 히스토리

### v1.0.0 (2024-05-13)
- ✅ IssueDetailModal 컴포넌트 구현
- ✅ IssueListItem 컴포넌트 구현
- ✅ IssueListSection 컨테이너 구현
- ✅ 부드러운 슬라이드인 애니메이션
- ✅ 페르소나별 분석 시각화
- ✅ 다크모드 지원
- ✅ Mock 데이터 제공

## 💬 질문 및 피드백

컴포넌트 사용 중 질문이나 개선 사항이 있으면 알려주세요!
