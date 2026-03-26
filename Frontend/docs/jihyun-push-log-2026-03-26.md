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

