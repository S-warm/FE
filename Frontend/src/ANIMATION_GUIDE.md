# 🎬 Swarm Dashboard - Animation System Integration Guide

## 📋 목차
1. [설치 및 적용](#설치-및-적용)
2. [컴포넌트 가이드](#컴포넌트-가이드)
3. [CSS 애니메이션](#css-애니메이션)
4. [베스트 프랙티스](#베스트-프랙티스)
5. [성능 최적화](#성능-최적화)

---

## 설치 및 적용

### 1단계: CSS 파일 임포트
프로젝트의 메인 CSS 파일(`index.css` 또는 `main.tsx`)에 애니메이션 스타일을 추가:

```typescript
// src/main.tsx
import './styles/animations.css';  // ← 추가
import App from './App.tsx';
```

### 2단계: 컴포넌트 사용
필요한 컴포넌트를 임포트하고 사용:

```typescript
import { KPICard } from './components/KPICard';
import { AnimatedModal } from './components/AnimatedModal';

export const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <KPICard
        title="Conversion Rate"
        value={68.0}
        unit="%"
        trend="up"
        trendValue={5.2}
      />
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <AnimatedModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test">
        Hello World
      </AnimatedModal>
    </>
  );
};
```

---

## 컴포넌트 가이드

### 1. KPICard (KPI 숫자 애니메이션)

숫자를 0에서 목표값까지 부드럽게 카운팅하는 카드 컴포넌트입니다.

**파일 위치:** `src/components/KPICard.tsx`

**Props:**

| Props | Type | 설명 | 기본값 |
|-------|------|------|--------|
| `title` | string | 카드 제목 | - |
| `value` | number | 표시할 숫자 | - |
| `unit` | string | 단위 (%, 명, 초 등) | '' |
| `icon` | React.ReactNode | 카드 아이콘 | undefined |
| `description` | string | 설명 텍스트 | undefined |
| `variant` | 'default' \| 'success' \| 'warning' \| 'error' | 컬러 스타일 | 'default' |
| `trend` | 'up' \| 'down' \| 'neutral' | 추세 표시 | undefined |
| `trendValue` | number | 추세 수치 | undefined |
| `decimalPlaces` | number | 소수점 자릿수 | 1 |
| `animationDuration` | number | 애니메이션 시간 (ms) | 1500 |

**사용 예시:**

```typescript
// 기본 KPI 카드
<KPICard
  title="Conversion Rate"
  value={68.0}
  unit="%"
/>

// 추세 정보 포함
<KPICard
  title="Total Users"
  value={250}
  unit="명"
  description="Last 30 days"
  trend="up"
  trendValue={12.5}
  variant="success"
  animationDuration={2000}
/>

// 에러 표시
<KPICard
  title="Error Rate"
  value={3.2}
  unit="%"
  trend="down"
  trendValue={-2.1}
  variant="error"
/>
```

**동작:**
- 페이지 로드 시 0에서 `value`까지 카운팅
- 부드러운 easing (cubic-bezier)으로 자연스러운 느낌
- `decimalPlaces`에 따라 소수점 표시

---

### 2. AnimatedModal (모달 애니메이션)

부드러운 scale + fade 애니메이션의 모달 컴포넌트입니다.

**파일 위치:** `src/components/AnimatedModal.tsx`

**Props:**

| Props | Type | 설명 | 기본값 |
|-------|------|------|--------|
| `isOpen` | boolean | 모달 열림/닫힘 | - |
| `onClose` | () => void | 닫기 콜백 | - |
| `title` | string | 모달 제목 | - |
| `children` | React.ReactNode | 모달 내용 | - |
| `footer` | React.ReactNode | 하단 버튼 영역 | undefined |
| `size` | 'sm' \| 'md' \| 'lg' | 모달 크기 | 'md' |
| `closeOnOverlay` | boolean | 오버레이 클릭으로 닫기 | true |

**사용 예시:**

```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Open Modal</button>
    <AnimatedModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Confirm Action"
      size="md"
      footer={
        <>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={() => setIsOpen(false)}>Confirm</button>
        </>
      }
    >
      <p>Are you sure you want to proceed?</p>
    </AnimatedModal>
  </>
);
```

**특징:**
- ESC 키로 닫기 가능
- 오버레이 클릭으로 닫기 (설정 가능)
- 열림/닫힘 애니메이션 (300ms)
- 배경 스크롤 방지

---

### 3. SkeletonLoader (로딩 상태)

데이터 로딩 중 shimmer 애니메이션으로 표시합니다.

**파일 위치:** `src/components/SkeletonLoader.tsx`

**주요 컴포넌트:**

#### SkeletonLoader
```typescript
<SkeletonLoader type="text" count={3} />
<SkeletonLoader type="card" count={4} />
<SkeletonLoader type="chart" />
<SkeletonLoader type="table" count={5} />
```

#### KPICardSkeleton
```typescript
<KPICardSkeleton count={4} />  // 4개의 KPI 카드 스켈레톤
```

#### ChartSkeleton
```typescript
<ChartSkeleton height="300px" />
```

#### ListItemSkeleton
```typescript
<ListItemSkeleton count={5} />
```

**사용 예시:**

```typescript
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  fetchData().then(result => {
    setData(result);
    setIsLoading(false);
  });
}, []);

return isLoading ? (
  <KPICardSkeleton count={4} />
) : (
  <div className="grid grid-cols-4 gap-4">
    {data.map(item => <KPICard {...item} />)}
  </div>
);
```

---

### 4. AnimatedDrawer (사이드바 애니메이션)

오른쪽/왼쪽에서 슬라이드로 진입하는 드로어입니다.

**파일 위치:** `src/components/AnimatedModal.tsx`

**Props:**

| Props | Type | 설명 | 기본값 |
|-------|------|------|--------|
| `isOpen` | boolean | 열림/닫힘 | - |
| `onClose` | () => void | 닫기 콜백 | - |
| `title` | string | 드로어 제목 | - |
| `children` | React.ReactNode | 드로어 내용 | - |
| `position` | 'left' \| 'right' | 진입 방향 | 'right' |

**사용 예시:**

```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Settings</button>
    <AnimatedDrawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Settings"
      position="right"
    >
      <div className="space-y-4">
        <label>
          <input type="checkbox" /> Dark Mode
        </label>
        <label>
          <input type="checkbox" /> Notifications
        </label>
      </div>
    </AnimatedDrawer>
  </>
);
```

---

### 5. AnimatedDropdown (드롭다운 메뉴)

상단에서 아래로 떨어지는 드롭다운 메뉴입니다.

**파일 위치:** `src/components/AnimatedModal.tsx`

**Props:**

| Props | Type | 설명 |
|-------|------|------|
| `isOpen` | boolean | 열림/닫힘 |
| `items` | Array<{id, label, onClick, active?}> | 메뉴 항목 |
| `position` | 'top' \| 'bottom' | 진입 방향 |

**사용 예시:**

```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <div className="relative">
    <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
    <AnimatedDropdown
      isOpen={isOpen}
      items={[
        { id: '1', label: 'Edit', onClick: () => console.log('Edit') },
        { id: '2', label: 'Delete', onClick: () => console.log('Delete') },
        { id: '3', label: 'Share', onClick: () => console.log('Share'), active: true },
      ]}
      position="bottom"
    />
  </div>
);
```

---

### 6. useNumberAnimation (훅)

React Hook으로 숫자 애니메이션을 직접 제어할 수 있습니다.

**파일 위치:** `src/hooks/useNumberAnimation.ts`

**사용 예시:**

```typescript
import { useNumberAnimation } from '../hooks/useNumberAnimation';

export const CustomKPI = () => {
  const animatedValue = useNumberAnimation(68.0, 1500, 1);

  return <div>{animatedValue}%</div>;
};
```

---

## CSS 애니메이션

### 클래스 기반 애니메이션

CSS만 사용하여 애니메이션을 적용할 수 있습니다.

**파일 위치:** `src/styles/animations.css`

#### 버튼
```html
<button class="btn-primary">Click Me</button>
```

#### 탭 네비게이션
```html
<div class="tabs">
  <button class="tab active">Tab 1</button>
  <button class="tab">Tab 2</button>
</div>
```

#### 카드
```html
<div class="card">Content</div>
<div class="card interactive">Clickable Card</div>
```

#### 로딩
```html
<div class="skeleton"></div>
<div class="spinner"></div>
```

#### Fade & Slide
```html
<div class="fade-in">Fade In</div>
<div class="slide-in-left">Slide from Left</div>
<div class="slide-in-up">Slide from Up</div>
```

---

## 베스트 프랙티스

### 1. 애니메이션 타이밍
- **UI 피드백:** 150-200ms (빠른 느낌)
- **모달/드로어:** 300ms (부드러운 느낌)
- **로딩:** 1.5s 무한 반복 (완만한 느낌)

```typescript
// 좋은 예시
<KPICard animationDuration={1500} />  // 1.5초
<AnimatedModal />                       // 내부 300ms 설정됨

// 나쁜 예시
<KPICard animationDuration={5000} />   // 너무 느림
```

### 2. 접근성 (Accessibility)
모든 인터랙티브 요소에 focus state 추가:

```css
button:focus-visible {
  outline: 2px solid #0052cc;
  outline-offset: 2px;
}
```

### 3. 성능 (Performance)
- `transform`과 `opacity`만 사용 (GPU 가속 가능)
- `left`, `top`, `width` 등은 사용하지 않기
- 과도한 애니메이션은 피하기

```css
/* ✅ Good: GPU 가속 */
transform: translateY(-2px);
opacity: 0.8;

/* ❌ Bad: 리페인트 유발 */
top: -2px;
visibility: hidden;
```

### 4. 모바일 최적화
reduced motion 설정 존중:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 성능 최적화

### 1. 번들 크기
- CSS 파일: ~4KB (압축 후)
- 컴포넌트: Tree-shaking 가능

### 2. 렌더링 최적화
```typescript
// 불필요한 리렌더링 방지
const MemoizedKPICard = React.memo(KPICard);

// 또는 useMemo 사용
const kpiCard = useMemo(() => (
  <KPICard {...props} />
), [props]);
```

### 3. 애니메이션 성능
```typescript
// useCallback으로 콜백 최적화
const handleClose = useCallback(() => {
  setIsOpen(false);
}, []);
```

---

## 데모 페이지

모든 애니메이션을 한 눈에 볼 수 있는 데모 페이지가 있습니다:

**파일 위치:** `src/components/AnimationShowcase.tsx`

### 사용 방법

1. 라우트에 추가:
```typescript
import { AnimationShowcase } from './components/AnimationShowcase';

// 라우팅 설정
<Route path="/animations" element={<AnimationShowcase />} />
```

2. 브라우저에서 `/animations` 접속하여 모든 애니메이션 확인

---

## 트러블슈팅

### 문제: 애니메이션이 실행되지 않음
**해결:**
1. CSS 파일이 임포트되었는지 확인
2. 브라우저 DevTools에서 CSS가 적용되었는지 확인
3. 콘솔에 에러가 있는지 확인

### 문제: 성능이 저하됨
**해결:**
1. `will-change` 사용 (주의: 과도하게 사용하면 역효과)
2. 불필요한 애니메이션 제거
3. CPU 프로파일링으로 병목 지점 확인

### 문제: 모달이 닫히지 않음
**해결:**
1. `onClose` 콜백 함수가 올바르게 전달되었는지 확인
2. 상태 관리가 올바른지 확인
3. 콘솔 에러 확인

---

## 다음 단계

### 애니메이션 확장
1. **Gesture 애니메이션** (Framer Motion 고려)
2. **SVG 애니메이션** (차트 드로우 효과)
3. **마이크로 인터랙션** 추가

### 통합 예정
- [ ] Framer Motion으로 복잡한 애니메이션 구현
- [ ] 다크모드 애니메이션 전환
- [ ] Storybook으로 컴포넌트 문서화
- [ ] 성능 모니터링 대시보드 추가

---

## 참고 자료

- [MDN Web Docs - CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Web.dev - Animation Performance](https://web.dev/animations/)
- [Cubic Bezier Generator](https://cubic-bezier.com/)
- [Can I Use - CSS Animations](https://caniuse.com/css-animation)

---

**마지막 업데이트:** 2026년 6월 1일  
**작성자:** Senior UI/UX Designer (Swarm Team)
