# jihyun 브랜치 푸시 내역 (2026-03-26)

대상 저장소: `FE/Frontend`  
브랜치: `jihyun`  
원격: `origin/jihyun`  

## 요약

- `main` 최신 상태(`eda3d1e`)를 `jihyun`에 반영 후 원격에 동기화
- 결과 탭/슬라이더/토큰 정리 리팩토링을 `d2e41e6`로 추가 푸시

## Push 1) `origin/jihyun` 동기화 (이전 원격: `9c2fbcc` → 반영 후: `eda3d1e`)

다음 커밋들이 `9c2fbcc..eda3d1e` 범위로 원격에 반영됨:

- `eda3d1e` Merge branch 'jihyun'
- `8b1f2a7` Merge branch 'jihyun'
- `1e83459` Merge branch 'jihyun'
- `a30b218` [FE] main ← jihyun 머지: 결과 탭 구현/UX 개선
- `21a53e4` Merge pull request #14 from S-warm/jihyun
- `1274791` Revert "Merge branch 'jihyun'"
- `abccd16` Merge branch 'jihyun'
- `7d382de` Merge pull request #9 from S-warm/jihyun
- `9232473` Merge pull request #7 from S-warm/jihyun

## Push 2) 리팩토링/토큰 정리 (현재 `jihyun` HEAD: `d2e41e6`)

범위: `eda3d1e..d2e41e6`

- `d2e41e6` refactor: align tokens and fix result pages

### 변경 파일(요약)

- `src/assets/mocks/example_site.png` → `src/assets/mocks/img-example-site.png` (rename)
- `src/components/forms/range-slider.tsx` (토큰/접근성/계산 안정화)
- `src/components/forms/setting-slider.tsx` (토큰/계산 안정화)
- `src/components/sections/simulation-setup/age-distribution-card.tsx` (토큰 치환)
- `src/components/ui/slider.tsx` (토큰 치환)
- `src/index.css` (차트 토큰 추가)
- `src/mocks/result-ai-fix.mock.ts` (escape 정리)
- `src/mocks/result-heatmap.mock.ts`, `src/mocks/result-pages.mock.ts` (에셋 경로 갱신)
- `src/pages/result/ResultAiFixPage.tsx` (derived state 정리)
- `src/pages/result/ResultHeatmapPage.tsx` (derived state 정리 + memo)
- `src/pages/result/ResultOverviewPage.tsx` (차트 컬러 토큰화)

## 미구현 기능 체크리스트 (기능 추가용)

아래 항목들은 UI는 존재하지만 기능이 완성되지 않았거나(또는 더미/비활성) 제품적으로 결정이 필요한 상태입니다.

- [ ] 결과 화면: `PDF 다운로드` (`FE/Frontend/src/pages/result/ResultLayoutPage.tsx:79`)
- [ ] 결과 화면: `공유하기` (`FE/Frontend/src/pages/result/ResultLayoutPage.tsx:89`)
- [ ] 히트맵: `전체보기` 버튼(현재 disabled) (`FE/Frontend/src/pages/result/ResultHeatmapPage.tsx:279`)
- [ ] 결과 데이터: mock → 실데이터 전환(히트맵/차트/이슈/AI 수정 전반)
- [ ] 결과 화면: 시뮬레이션 제목 수정(연필 아이콘) (`FE/Frontend/src/pages/result/ResultLayoutPage.tsx:50`)

## Heatmap 실데이터 JSON 스펙(초안)

백엔드 스펙은 “확정되었지만 아직 전달받지 못함(추후 확인)” 상태라, 프론트에서 검증/요청하기 위한 최소 스펙 초안을 남깁니다.

### 1) 페이지 단위 메타

- `pageId`: string (라우팅/사이드패널과 매칭)
- `url`: string
- `device`: `"desktop" | "mobile"`
- `viewport`: `{ width: number; height: number; dpr: number }`
- `screenshot`: `{ url: string; width: number; height: number; capturedAt: string }`

### 2) 이벤트(히트맵 원천)

- `events[]`: 각 이벤트는 좌표가 “스크린샷 캡처 시점” 기준으로 정규화되어야 함(레이아웃 불일치 방지)
- 예시:
  - `type`: `"click" | "move" | "scroll"`
  - `x`: number (0~1, screenshot 기준)
  - `y`: number (0~1, screenshot 기준)
  - `t`: number (ms, 세션 시작 대비)
  - `dwellMs?`: number (move/attention 계열이면)
  - `element?`: `{ selector?: string; role?: string; text?: string }`

### 3) 이슈/마커(분석 결과)

- `markers[]`: `{ id, x, y, label, severity, issueId? }`
- `issues[]`: `{ id, title, description, category, severity, selector?, impactedUsers }`

> 핵심 전제: “사이트를 나중에 이미지로 다시 가져오는 방식”은 좌표가 어긋날 가능성이 커서, 이벤트 수집 시점의 `viewport + screenshot`을 함께 저장하고 그 기준으로만 오버레이를 렌더링하는 구성이 안전합니다.
