/**
 * 이슈 상세 분석 데이터 타입 정의
 * JSON에서 제공하는 모든 데이터를 활용
 */

import type { ResultIssueViewModel } from "./result-issues"
import type { SeverityTokenViewModel } from "../common/severity"

/**
 * 원본 JSON 포맷 - 완전한 데이터 구조
 */
export interface IssueDetailRaw {
  url: string
  category: string
  subCategory: string
  severity: "high" | "medium" | "low"
  title: string
  description: string
  targetHtml: string
  tags: string[]
  fail_count: number
  fail_rate: number
  session_ids: string[]
  persona_ages: string[]
  affected_personas: Array<{
    session_id: string
    persona_age: string
  }>
}

/**
 * 페르소나별 분석 데이터
 */
export interface PersonaAnalysis {
  age: string
  count: number
  percentage: number
  sessionIds: string[]
}

/**
 * 통합 이슈 상세 정보
 */
export interface IssueDetailViewModel {
  // 기본 정보
  issueId: string
  url: string
  title: string
  category: string
  subCategory: string
  description: string
  severity: SeverityTokenViewModel
  targetHtml: string
  tags: string[]

  // 발생 통계
  totalFailures: number
  failureRate: number

  // 영향받은 사용자
  affectedUsersCount: number
  affectedUsersPercent: number

  // 페르소나 분석
  personas: PersonaAnalysis[]
  personaList: string[]

  // 세션 정보
  sessionIds: string[]
  affectedSessions: Array<{
    sessionId: string
    personaAge: string
  }>
}

export interface IssueDetailModalState {
  isOpen: boolean
  selectedIssue: IssueDetailViewModel | null
}

/**
 * ResultIssueViewModel을 IssueDetailViewModel으로 변환
 */
export function mapResultIssueToDetail(issue: ResultIssueViewModel): IssueDetailViewModel {
  return {
    issueId: issue.issueId,
    url: "",
    title: issue.title,
    category: issue.category,
    subCategory: "",
    description: issue.description,
    severity: issue.severity,
    targetHtml: issue.selector,
    tags: issue.tags,
    totalFailures: issue.affectedUsersCount,
    failureRate: issue.affectedUsersPercent,
    affectedUsersCount: issue.affectedUsersCount,
    affectedUsersPercent: issue.affectedUsersPercent,
    personas: [],
    personaList: [],
    sessionIds: [],
    affectedSessions: [],
  }
}
