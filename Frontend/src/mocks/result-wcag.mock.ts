import { getMasterIssuesByPage, resultMasterPages, type ResultMasterSeverity } from "@/mocks/result-master.mock"

export type WcagSeverity = "critical" | "moderate" | "minor"

export interface WcagIssueDistribution {
  severity: WcagSeverity
  label: string
  description: string
  count: number
}

export interface WcagDetailIssue {
  id: string
  issueNo: number
  title: string
  severity: WcagSeverity
  summary: string
  description: string
  guidance: string
  selector: string
  criterion: string
}

export interface WcagPageResult {
  pageId: string
  pageName: string
  complianceScore: number
  scoreInterpretation: string
  wcagLabel: string
  passedTests: number
  totalTests: number
  foundIssues: number
  distribution: WcagIssueDistribution[]
  details: WcagDetailIssue[]
}

export interface WcagResultMock {
  pageResults: WcagPageResult[]
}

const PAGE_SCORES: Record<string, number> = {
  login: 38,
  main: 45,
  signup: 42,
  payment: 40,
}

const PAGE_PASSES: Record<string, number> = {
  login: 5,
  main: 4,
  signup: 4,
  payment: 4,
}

function severityRank(severity: ResultMasterSeverity) {
  if (severity === "critical") return 0
  if (severity === "moderate") return 1
  return 2
}

function toWcagSeverity(severity: ResultMasterSeverity): WcagSeverity {
  if (severity === "critical") return "critical"
  if (severity === "moderate") return "moderate"
  return "minor"
}

function createDistribution(pageId: string): WcagIssueDistribution[] {
  const issues = getMasterIssuesByPage(pageId as "login" | "main" | "signup" | "payment")
  const counts = issues.reduce(
    (acc, issue) => {
      acc[toWcagSeverity(issue.severity)] += 1
      return acc
    },
    { critical: 0, moderate: 0, minor: 0 }
  )

  return [
    { severity: "critical", label: "Critical", description: "즉시 수정이 필요한 주요 접근성 위반", count: counts.critical },
    { severity: "moderate", label: "Moderate", description: "작업 흐름을 방해하는 중간 수준 위반", count: counts.moderate },
    { severity: "minor", label: "Minor", description: "누적 피로를 만드는 경미한 위반", count: counts.minor },
  ]
}

function createScoreInterpretation(pageId: string) {
  if (pageId === "login") return "필수 입력 구조와 라벨 대비 문제가 함께 나타나 첫 진입 화면의 이해도가 낮습니다."
  if (pageId === "main") return "핵심 CTA와 가격 정보의 시각 계층이 약해 탐색 행동 유도가 흔들립니다."
  if (pageId === "signup") return "입력 규칙과 포커스 흐름이 불안정해 고연령 사용자에게 특히 부담이 큽니다."
  return "결제 직전 피드백과 강조 요소가 부족해 마지막 단계의 확신 형성이 어렵습니다."
}

export const wcagResultMock: WcagResultMock = {
  pageResults: resultMasterPages.map((page) => {
    const issues = getMasterIssuesByPage(page.id).sort((left, right) => severityRank(left.severity) - severityRank(right.severity))

    return {
      pageId: page.id,
      pageName: page.name,
      complianceScore: PAGE_SCORES[page.id],
      scoreInterpretation: createScoreInterpretation(page.id),
      wcagLabel: "미달",
      passedTests: PAGE_PASSES[page.id],
      totalTests: 10,
      foundIssues: issues.length,
      distribution: createDistribution(page.id),
      details: issues.map((issue, index) => ({
        id: issue.id,
        issueNo: index + 1,
        title: issue.title,
        severity: toWcagSeverity(issue.severity),
        summary: issue.wcagSummary,
        description: `${issue.description} ${issue.reportedPersona}`,
        guidance: issue.wcagGuidance,
        selector: issue.selector,
        criterion: issue.wcag,
      })),
    }
  }),
}
