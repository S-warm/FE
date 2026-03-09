export interface DonutDatum {
  name: string
  value: number
  color: string
}

export interface ProgressDatum {
  label: string
  score: number
}

export interface HeatmapCell {
  id: string
  value: number
}

export interface IssueItem {
  id: string
  severity: "error" | "warning" | "info"
  title: string
  description: string
  suggestion: string
}

export const summaryScore = 78

export const donutData: DonutDatum[] = [
  { name: "시각요소", value: 36, color: "var(--color-primary-main)" },
  { name: "텍스트", value: 29, color: "var(--color-blue-gray-300)" },
  { name: "기타", value: 35, color: "var(--color-neutral-400)" },
]

export const progressData: ProgressDatum[] = [
  { label: "텍스트 대비", score: 64 },
  { label: "버튼 가시성", score: 82 },
  { label: "탐색 명확성", score: 74 },
  { label: "폼 피드백", score: 59 },
]

function seededPercent(index: number) {
  return (index * 37 + 23) % 100
}

export const heatmapData: HeatmapCell[] = Array.from({ length: 64 }, (_, index) => ({
  id: `cell-${index}`,
  value: seededPercent(index),
}))

export const issueData: IssueItem[] = [
  {
    id: "issue-1",
    severity: "error",
    title: "텍스트 대비가 너무 낮음",
    description: "로그인 버튼 하단 설명 텍스트가 배경과 명도 차이가 낮아 가독성이 떨어집니다.",
    suggestion: "텍스트 색상을 `text-foreground` 또는 `text-primary-600`로 조정하세요.",
  },
  {
    id: "issue-2",
    severity: "warning",
    title: "입력 필드 레이블의 위치 일관성 부족",
    description: "일부 필드의 레이블이 placeholder만으로 대체되어 사용자가 맥락을 잃을 수 있습니다.",
    suggestion: "모든 입력 필드 상단에 고정 레이블을 추가하세요.",
  },
  {
    id: "issue-3",
    severity: "info",
    title: "탭 활성 상태 강조 보완 필요",
    description: "활성 탭과 비활성 탭의 시각 차이가 모바일에서 약하게 보입니다.",
    suggestion: "활성 탭 하단 보더 두께 또는 텍스트 굵기를 높여 차이를 강화하세요.",
  },
]
