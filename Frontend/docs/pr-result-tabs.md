# PR: 결과 화면 탭(주요이슈/WCAG/히트맵/여정/AI수정) 구현

## 개요
결과 화면(`/result/:simulationId/...`)에서 탭별 기능을 빠르게 확인할 수 있도록 placeholder를 실페이지로 대체하고, 더미 데이터/문서를 추가했습니다.

## 주요 변경사항
### Routing / Tabs
- 결과 탭 라우트 실구현 연결
    - `/result/:simulationId/issues` → `ResultIssuesPage`
    - `/result/:simulationId/wcag` → `ResultWcagPage`
    - `/result/:simulationId/ai` → `ResultAiFixPage`
    - `/result/:simulationId/heatmap` → `ResultHeatmapPage`
  - 탭 네비게이션에서 “히트맵” 탭 제공

### 주요이슈(issues)
- 좌측 필터(접근성/사용성/시각요소/기타) + 페이지 선택
- 카테고리 분류(도넛) + 이슈 리스트
- 액션 네비게이션
  - “AI 수정 받기” → `ai` 탭
  - “히트맵에서 보기” → `heatmap` 탭

### WCAG(wcag)
- 준수 점수/통과 테스트/발견 이슈 요약
- 심각도 분포 바 + 상세 결과(토글)

### AI 수정(ai)
- 페이지별 수정안 선택 → 코드 비교(이전/이후) + 영향/변경 요약
- 더미 코드 블록은 CSS로 통일

### 히트맵(heatmap)
- 스크린샷(더미 이미지) 위 히트맵 오버레이(퍼센트 좌표 기준)
- 결함 리스트 클릭 시 해당 마커 강조 + 캔버스 자동 스크롤

## 더미 데이터 / 에셋
- 더미 데이터 중앙화
  - `Frontend/src/mocks/result-issues.mock.ts`
  - `Frontend/src/mocks/result-wcag.mock.ts`
  - `Frontend/src/mocks/result-ai-fix.mock.ts`
  - `Frontend/src/mocks/result-heatmap.mock.ts`
- 더미 스크린샷 이미지
  - `Frontend/src/assets/mocks/mock-page-screenshot-photo.svg`

## 문서
- 탭별 작업 내용 정리
    - `Frontend/docs/result-issues-tab.md`
    - `Frontend/docs/result-wcag-tab.md`
    - `Frontend/docs/result-ai-tab.md`
    - `Frontend/docs/result-heatmap-tab.md`

## 참고
- 스크린샷은 추후 **백엔드 캡처 후 저장된 이미지 URL**로 교체 예정
- 히트맵 좌표는 `%` 기준
- 현재 데이터/로그는 더미이며 API 스키마 확정 후 연동 예정
- `npm run build` 통과
