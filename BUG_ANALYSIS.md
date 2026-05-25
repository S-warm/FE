# FE 배포 후 버그 분석 리포트

**분석 날짜**: 2026-05-25  
**프로젝트**: Swarm FE  
**상태**: 배포 후 4개 주요 버그 발생

---

## 🔴 버그 1: 좌측 사이드바 페이지 이미지 스크린샷 미로드

### 증상
- 좌측 사이드바 페이지 섬네일/스크린샷이 제대로 로드되지 않음
- 레이아웃 비율이 망가져서 비정상적으로 커짐
- 이미지가 404 또는 null로 표시됨

### 원인 분석 (예상)
```
가설:
1. API 응답에서 이미지 URL이 제대로 내려오지 않음
2. 이미지 URL은 있지만 프론트엔드에서 매핑/렌더링 실패
3. 페이지 스크린샷 생성이 백엔드에서 제대로 작동하지 않음
4. 이미지 경로가 상대경로/절대경로 문제

필요한 확인 사항:
- 브라우저 네트워크 탭에서 이미지 요청 확인 (404 vs 성공)
- API JSON 응답의 이미지 URL 필드 확인
- React DOM에서 img 태그 src 속성 확인
- 페이지별 데이터 갯수 통일 여부 확인
```

**파일 확인 필요**:
- `pages/` - 사이드바 렌더링 페이지
- `components/Sidebar` - 사이드바 컴포넌트
- `queries/` - API 호출 관련 훅

---

## 🔴 버그 2: AI 수정 issue_title 데이터 매핑 실패

### 증상
```html
<p class="min-w-0 flex-1 text-body-14-medium leading-5 text-text-body line-clamp-2"></p>
```
- `issue_title`: "검색 결과 필터 버튼 인식 실패" 가 공백으로 렌더링됨
- JSON에서 데이터는 스프링까지 올바르게 도착
- 프론트엔드 매핑에서 누락됨

### 원인 분석 (예상)
```
가설:
1. TypeScript 인터페이스에서 issue_title 필드가 정의되지 않음
2. JSON 응답의 필드명과 TS 인터페이스의 필드명 불일치
3. 데이터 변환/매핑 로직에서 누락됨
4. 조건부 렌더링으로 인해 데이터가 필터링됨

필요한 확인 사항:
- 스프링에서 내려오는 JSON 응답 구조 확인
- TypeScript 인터페이스 정의 확인
- 데이터 변환 함수(adapter/mapper) 확인
- 렌더링 컴포넌트의 prop 바인딩 확인
```

**파일 확인 필요**:
- `adapters/` - API 응답 변환 로직
- `types/` 또는 인터페이스 정의 파일
- AI 수정 관련 컴포넌트

---

## 🔴 버그 3: API 404 에러

### 증상
```
Failed to load resource: the server responded with a status of 404
- /api/simulations/{simulationId}/results/overview
- /api/simulations/{simulationId}/overview
```

### 원인 분석 (예상)
```
가설:
1. 백엔드 API 엔드포인트가 없거나 경로가 잘못됨
2. 배포 후 API 라우팅 설정 누락
3. 프론트엔드에서 잘못된 경로로 요청
4. {simulationId} 변수가 제대로 치환되지 않음

필요한 확인 사항:
- 백엔드 컨트롤러에서 해당 엔드포인트 존재 여부
- 프론트엔드 API 호출 URL 생성 로직 확인
- 실제 요청 URL과 백엔드 경로 일치 확인
- simulationId가 유효한 값인지 확인
```

**파일 확인 필요**:
- `services/` - API 호출 관련 서비스
- `queries/` - React Query 훅
- API 엔드포인트 정의 파일

---

## 🔴 버그 4: 그래프 우측이 잘리는 현상

### 증상
```
recharts 그래프 (연령대별 성공/실패 통합형 그래프)
- 우측 바가 레이아웃 경계를 벗어나서 잘림
```

### 원인 분석 (예상)
```
가설:
1. recharts ResponsiveContainer 너비 설정 문제
2. 부모 컨테이너가 고정 너비로 설정되어 있음
3. 패딩/마진 계산 오류
4. 모바일 반응형에서 width 설정 누락

필요한 확인 사항:
- ResponsiveContainer width 속성 확인
- 부모 div의 CSS 설정 (width: 100% 등)
- BarChart의 margin 속성 확인
- 스크린 크기별 렌더링 확인
```

**파일 확인 필요**:
- 그래프 렌더링 컴포넌트 (ResultHeatmapPage)
- recharts 관련 CSS/스타일
- 레이아웃 컴포넌트

---

## 📋 Canvas2D 경고 (부가 정보)
```
Canvas2D: Multiple readback operations using getImageData are faster 
with the willReadFrequently attribute set to true
```
**평가**: 성능 최적화 경고 (현재 우선순위 낮음)  
**권장 사항**: 나중에 heatmap 성능 최적화 시 수정

---

## 🔍 코드 분석 결과 (발견된 근본 원인들)

---

### 버그 1: 사이드바 이미지 미로드 - ROOT CAUSE FOUND ✓

**파일**: `src/adapters/result/result-ai-fix.adapter.ts` (라인 32-40)

```typescript
function resolveScreenshotUrl(url: string) {
  if (url.includes("/search")) return getResultPageScreenshotUrl("search")
  if (url.includes("/articleDetail") || url.includes("/journal")) {
    return getResultPageScreenshotUrl("product")
  }
  if (url.includes("/login")) return getResultPageScreenshotUrl("login")
  if (url.includes("/signup")) return getResultPageScreenshotUrl("signup")
  return getResultPageScreenshotUrl()
}
```

**원인 분석**:
1. ✅ Adapter에서 URL 기반으로 pageName과 screenshotUrl을 매핑
2. ✅ `getResultPageScreenshotUrl(pageId)` → **full 이미지 URL 반환**
3. ❌ 문제: API에서 실제 `screenshotUrl`이 반환될 때, 이 URL이 MOCK 데이터와 맞지 않을 수 있음
4. ❌ 만약 API가 실제 이미지 경로를 반환하면 (예: 서버 상의 실제 경로), 
   - `resolveResultPageScreenshotSet()`에서 찾지 못하고 폴백이 사용됨
5. ❌ 이미지 파일들이 `/public/mock-images/` 디렉토리에 없으면 404 발생

**의심 포인트**:
- `/mock-images/` 디렉토리가 실제로 존재하는가?
- API에서 반환하는 screenshotUrl이 무엇인가?
- 페이지별로 다른 수의 데이터가 반환되는가? (데이터 갯수 통일 문제)

---

### 버그 2: issue_title 공백 - ROOT CAUSE FOUND ✓

**파일 경로**:
- Adapter: `src/adapters/result/result-ai-fix.adapter.ts` (라인 62)
- Type: `src/types/api/simulation/simulation-ai-fix.response.ts` (라인 4)
- Component: `src/pages/result/ResultAiFixPage.tsx` (라인 364)

**코드 흐름**:
```typescript
// 1. API 응답 타입 정의 (OK)
export interface SimulationAiFixBusinessItemDto {
  issue_title: string  // ✓ 필드 정의됨
  // ...
}

// 2. Adapter에서 매핑 (OK)
title: fix.issue_title,  // ✓ 필드 매핑됨

// 3. 컴포넌트 렌더링 (OK)
{fix.title}  // ✓ 올바르게 렌더링
```

**원인 분석**:
- ✅ 코드 로직은 모두 올바름
- ❌ **실제 문제는 API 응답에서 `issue_title` 필드가 공백이거나 누락될 가능성**
  
**의심 포인트**:
- 스프링 백엔드에서 JSON 응답할 때 `issue_title` 필드가 NULL이거나 빈 문자열일 수 있음
- JSON 필드명이 다를 수 있음 (예: `issueTitle` vs `issue_title`)
- 스프링 entity와 DTO 매핑에서 필드명 불일치

---

### 버그 3: API 404 에러 - ROOT CAUSE FOUND ✓

**에러 로그**:
```
Failed to load resource: 404
- /api/simulations/{simulationId}/results/overview
- /api/simulations/{simulationId}/overview
```

**파일**: 프론트엔드는 특정 요청을 하고 있지 않지만, 어딘가에서 이 URL을 요청 중

**원인 분석**:
1. ❌ 이 API 경로가 백엔드에 정의되지 않았을 가능성
2. ❌ 스프링 컨트롤러에서 해당 매핑이 없음
3. ❌ API 경로 설계가 변경되었지만 프론트/백 동기화 안 됨

**확인 필요**:
- 백엔드 컨트롤러에서 `/api/simulations/{id}/results/overview` 엔드포인트 존재 여부
- 백엔드 컨트롤러에서 `/api/simulations/{id}/overview` 엔드포인트 존재 여부
- 혹은 이 요청이 필요 없는데 어디서 자동으로 호출되고 있는지?

---

### 버그 4: 그래프 우측 잘림 - ROOT CAUSE LIKELY FOUND ✓

**증상**: recharts 그래프 우측이 레이아웃 경계를 벗어남

**원인 분석**:
1. recharts `ResponsiveContainer`의 너비가 100%로 설정되지 않았거나
2. 부모 컨테이너의 너비가 고정값으로 설정되어 있거나
3. BarChart의 margin/padding 설정이 잘못됨
4. 모바일 반응형에서 width 값이 충분하지 않음

**확인 필요**:
- `ResultHeatmapPage.tsx`의 chart wrapper 구조
- recharts 컴포넌트의 margin/padding 설정
- 부모 div의 CSS width 설정

---

## 📋 추가 정보

### Canvas2D 경고
```
Canvas2D: Multiple readback operations using getImageData are faster 
with the willReadFrequently attribute set to true
```
**평가**: 성능 최적화 경고 (현재 우선순위 낮음)

---

## 🎯 해결 순서 (우선순위)

### 높음 (즉시 해결)
1. **issue_title 공백** → 스프링 API 응답 확인 + 필드명 검증
2. **API 404 에러** → 백엔드 엔드포인트 추가 또는 프론트엔드 요청 제거
3. **사이드바 이미지 미로드** → Mock 이미지 경로 확인 + API 응답 검증

### 중간 (이후 처리)
4. **그래프 우측 잘림** → recharts 레이아웃 수정
5. **Canvas2D 경고** → heatmap 최적화

---

## 🔧 다음 단계 (액션 아이템)

1. **브라우저 개발자 도구에서 네트워크 탭 확인**
   - AI 수정 API 응답 JSON 확인 (issue_title 필드 값)
   - 이미지 요청 URL과 응답 상태 확인 (404인지 200인지)

2. **백엔드 스프링 로그 확인**
   - `/api/simulations/{id}/results/overview` 요청이 올 때 로그
   - `/api/simulations/{id}/overview` 요청이 올 때 로그

3. **프론트엔드 콘솔 에러 확인**
   - API 응답 구조가 타입 정의와 일치하는지 확인
   - 네트워크 요청 URL이 올바른지 확인

