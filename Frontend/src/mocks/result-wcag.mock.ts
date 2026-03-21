export type WcagSeverity = "critical" | "moderate" | "minor"

export interface WcagIssueDistribution {
  severity: WcagSeverity
  label: string
  description: string
  count: number
}

export interface WcagPageFinding {
  pageName: string
  total: number
  breakdown: {
    critical: number
    moderate: number
    minor: number
  }
}

export interface WcagDetailIssue {
  id: string
  issueNo: number
  title: string
  severity: WcagSeverity
  description: string
}

export interface WcagResultMock {
  complianceScore: number
  wcagLabel: string
  passedTests: number
  totalTests: number
  foundIssues: number
  pageFindings: WcagPageFinding[]
  distribution: WcagIssueDistribution[]
  details: WcagDetailIssue[]
}

export const wcagResultMock: WcagResultMock = {
  complianceScore: 38,
  wcagLabel: "WCAG 2.1 LEVEL AA",
  passedTests: 3,
  totalTests: 10,
  foundIssues: 10,
  pageFindings: [
    { pageName: "로그인 페이지", total: 3, breakdown: { critical: 2, moderate: 1, minor: 0 } },
    { pageName: "메인 페이지", total: 4, breakdown: { critical: 1, moderate: 0, minor: 3 } },
    { pageName: "회원가입 페이지", total: 3, breakdown: { critical: 0, moderate: 3, minor: 0 } },
  ],
  distribution: [
    { severity: "critical", label: "Critical", description: "즉각 조치 필요", count: 3 },
    { severity: "moderate", label: "Moderate", description: "우선순위 높음", count: 4 },
    { severity: "minor", label: "Minor", description: "권장 수정 사항", count: 3 },
  ],
  details: [
    {
      id: "wcag-issue-1",
      issueNo: 1,
      title: "텍스트 대비율",
      severity: "critical",
      description:
        "본문/보조 텍스트의 대비가 WCAG 2.1 AA 기준을 충족하지 않아, 저시력 사용자의 가독성이 크게 저하됩니다. 대비(명도 차이)를 높이거나 배경색을 조정해 최소 대비율을 만족하도록 개선하세요.",
    },
    {
      id: "wcag-issue-2",
      issueNo: 2,
      title: "최소 글자 크기",
      severity: "moderate",
      description:
        "일부 설명 텍스트가 작은 글자 크기/좁은 행간으로 표시되어 읽기 어려울 수 있습니다. 12px 이하 텍스트를 줄이고, 기본 폰트 크기 및 line-height를 상향해 가독성을 개선하세요.",
    },
    {
      id: "wcag-issue-3",
      issueNo: 3,
      title: "위치 수정",
      severity: "minor",
      description:
        "포커스/오류 메시지의 노출 위치가 입력 컨텍스트와 멀리 떨어져 있어 사용자가 변경점을 놓칠 수 있습니다. 관련 요소 인근에 안내를 배치하고 포커스 이동을 명확히 하세요.",
    },
    {
      id: "wcag-issue-4",
      issueNo: 3,
      title: "위치 수정",
      severity: "minor",
      description:
        "동일한 유형의 안내 위치 이슈가 다른 섹션에서도 반복 발견되었습니다. 공통 컴포넌트 단위로 안내 영역을 정규화하면 수정 비용을 줄일 수 있습니다.",
    },
  ],
}

