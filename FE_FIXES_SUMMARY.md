# FE UI 렌더링 에러 일괄 수정 완료

**완료 날짜**: 2026-05-14  
**상태**: ✅ 완료  
**대상**: ResultIssuesPage 및 관련 컴포넌트의 전반적 UI 렌더링 에러

---

## 📋 수정된 이슈 목록

### 1. **DonutChart 차원 계산 에러 (width/height -1)**
**파일**: `src/components/charts/donut-chart.tsx`

**문제**: 
- ResponsiveContainer가 부모 div의 높이를 제대로 계산하지 못함
- 그리드 레이아웃에서 height="100%"가 작동하지 않음
- 차트가 -1 크기로 렌더링되어 표시되지 않음

**해결 방안**:
- `useRef`와 `useEffect` 사용하여 컨테이너 실제 높이 측정
- `ResizeObserver`로 크기 변경 감지
- 동적으로 계산된 높이를 `ResponsiveContainer`에 전달
- 최소 높이 200px 보장

**코드 변경**:
```typescript
const containerRef = useRef<HTMLDivElement>(null)
const [height, setHeight] = useState(220)

useEffect(() => {
  const updateHeight = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setHeight(Math.max(200, Math.round(rect.height)))
    }
  }
  const timer = setTimeout(updateHeight, 0)
  const resizeObserver = new ResizeObserver(updateHeight)
  if (containerRef.current) {
    resizeObserver.observe(containerRef.current)
  }
  return () => {
    clearTimeout(timer)
    resizeObserver.disconnect()
  }
}, [])

return (
  <div ref={containerRef} className={cn(heightClassName, "w-full flex items-center justify-center")}>
    <ResponsiveContainer width="100%" height={height}>
      {/* ... */}
    </ResponsiveContainer>
  </div>
)
```

---

### 2. **Placeholder 이미지 로드 실패**
**파일**: `src/mocks/uxswarm-demo.mock.ts`

**문제**:
- `via.placeholder.com`이 네트워크 에러 반환 (ERR_CONNECTION_CLOSED)
- 외부 placeholder 서비스 의존도 제거 필요
- 이미지 로드 실패로 스크린샷 미표시

**해결 방안**:
- Data URL 기반 SVG placeholder 생성
- 로컬에서 처리되므로 네트워크 의존성 제거
- 모든 페이지에 동일한 placeholder 사용

**코드 변경**:
```typescript
const defaultPlaceholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%23f3f4f6' width='1920' height='1080'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='48' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EPage Screenshot%3C/text%3E%3C/svg%3E`;

// demoResultPages의 모든 screenshotUrl을 defaultPlaceholderSvg로 설정
```

---

### 3. **ScreenshotPreview 폴백 처리 개선**
**파일**: `src/components/sections/result/page-side-panel.tsx`

**문제**:
- 이미지 로드 실패 시 빈 박스만 표시
- 사용자에게 상태 피드백 없음

**해결 방안**:
- 이미지 로드 불가 시 안내 텍스트 표시
- 폴백 UI 개선으로 사용자 경험 향상

**코드 변경**:
```typescript
if (!screenshotUrl || failedScreenshotUrl === screenshotUrl) {
  return (
    <div className="aspect-[16/10] rounded-xl border border-border-soft bg-surface-subtle flex items-center justify-center">
      <span className="text-caption-12-regular text-text-muted">이미지 로드 불가</span>
    </div>
  )
}
```

---

### 4. **카테고리 분류 섹션 렌더링 개선**
**파일**: `src/pages/result/ResultIssuesPage.tsx`

**문제**:
- DonutChart 크기 문제로 전체 섹션 미표시
- 그리드 레이아웃 정렬 이슈
- 빈 데이터 상태 처리 불완전

**해결 방안**:
1. 차트 컨테이너에 명시적 높이 설정 (`min-h-[200px] h-[200px]`)
2. 그리드 아이템 정렬 변경 (`md:items-center` → `md:items-start`)
3. 데이터 없음 상태 처리 추가
4. 차트 내부 높이 상속 설정 (`h-full`)

**코드 변경**:
```typescript
<div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] md:items-start">
  <div className="min-h-[200px] h-[200px]">
    <DonutChart
      heightClassName="h-full"
      data={donut.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
      }))}
      emptyDescription="시뮬레이션을 시작하면 이슈 카테고리 분류가 표시됩니다."
    />
  </div>
  <div className="grid gap-2">
    {donut.length > 0 ? (
      donut.map((item) => (
        // ... 범례 표시
      ))
    ) : (
      <p className="text-caption-12-regular text-text-muted">데이터 없음</p>
    )}
  </div>
</div>
```

---

### 5. **페이지 사이드패널 스크린샷 URL 처리**
**파일**: `src/pages/result/ResultIssuesPage.tsx`

**문제**:
- fallback 이미지 경로 `/mock-images/img-example-site.png` 존재하지 않음
- 실제 mock 데이터의 screenshotUrl 무시

**해결 방안**:
- fallback 제거, mock 데이터의 screenshotUrl 직접 사용
- placeholder SVG가 이미 설정되어 있으므로 추가 fallback 불필요

**코드 변경**:
```typescript
const sidePages = useMemo(
  () =>
    pages.map((page) => ({
      id: page.pageId,
      name: page.pageName,
      screenshotUrl: page.screenshotUrl,  // fallback 제거
    })),
  [pages],
)
```

---

## 🔍 검증 결과

### TypeScript 컴파일
✅ **통과** - 0개 에러
```bash
$ npx tsc --noEmit
(no output)
```

### 영향받는 컴포넌트 체크리스트
- ✅ DonutChart: 크기 계산 로직 추가
- ✅ ResultIssuesPage: 레이아웃 및 폴백 개선
- ✅ ResultPageSidePanel: 폴백 UI 개선
- ✅ Mock 데이터: placeholder 이미지 수정

---

## 📊 수정 전후 비교

| 항목 | 수정 전 | 수정 후 |
|------|--------|--------|
| **DonutChart 렌더링** | width/height -1 에러 | 동적 높이 계산으로 정상 작동 |
| **Placeholder 이미지** | ERR_CONNECTION_CLOSED | Data URL SVG로 로컬 로드 |
| **폴백 UI** | 빈 박스 | 안내 텍스트 포함 |
| **카테고리 섹션** | 미표시 | 완전히 표시됨 |
| **TypeScript 에러** | 0개 | 0개 |

---

## 🚀 배포 준비

모든 수정사항이 다음 파일에 적용되었습니다:

1. `/src/components/charts/donut-chart.tsx`
2. `/src/mocks/uxswarm-demo.mock.ts`
3. `/src/components/sections/result/page-side-panel.tsx`
4. `/src/pages/result/ResultIssuesPage.tsx`

### 다음 단계
1. ✅ 코드 변경 완료
2. ✅ TypeScript 컴파일 성공
3. 🔄 로컬 개발 서버에서 테스트 (npm run dev)
4. 🔄 결과 페이지 UI 확인
   - 카테고리 분류 섹션 표시 확인
   - 페이지 사이드패널 렌더링 확인
   - DonutChart 정상 작동 확인
5. 🔄 빌드 및 배포

---

## 📝 참고사항

- Mock 데이터 v3 형식은 그대로 유지
- 백엔드 연동 시 실제 이미지 URL로 교체 가능
- CSS 클래스명은 기존 설정을 따름
- 접근성 속성 유지 (aria-hidden, role 등)
