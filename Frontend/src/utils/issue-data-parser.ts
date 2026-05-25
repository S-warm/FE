/**
 * JSON 이슈 데이터를 IssueDetailViewModel으로 파싱하는 유틸
 * 실제 API 응답이나 데이터를 처리
 */

import type { IssueDetailViewModel, IssueDetailRaw, PersonaAnalysis } from "@/types/view-model/result/issue-detail"
import type { ResultIssueViewModel } from "@/types/view-model/result/result-issues"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

/**
 * 심각도 문자를 SeverityTokenViewModel로 변환
 */
function mapSeverityToToken(severity: string): SeverityTokenViewModel {
  const severityMap: Record<string, SeverityTokenViewModel> = {
    high: {
      raw: "high",
      tone: "error",
      label: "높음",
      rank: 3,
    },
    medium: {
      raw: "medium",
      tone: "warning",
      label: "중간",
      rank: 2,
    },
    low: {
      raw: "low",
      tone: "neutral",
      label: "낮음",
      rank: 1,
    },
  }

  return severityMap[severity.toLowerCase()] || severityMap.low
}

/**
 * 원본 JSON 데이터를 IssueDetailViewModel으로 변환
 */
export function parseIssueDataFromJSON(data: IssueDetailRaw, issueId: string): IssueDetailViewModel {
  // 페르소나별 분석 계산
  const personaMap = new Map<string, number>()
  const sessionsByPersona = new Map<string, string[]>()

  data.affected_personas.forEach((persona) => {
    const count = personaMap.get(persona.persona_age) || 0
    personaMap.set(persona.persona_age, count + 1)

    if (!sessionsByPersona.has(persona.persona_age)) {
      sessionsByPersona.set(persona.persona_age, [])
    }
    sessionsByPersona.get(persona.persona_age)!.push(persona.session_id)
  })

  // 페르소나별 분석 배열 생성
  const personas: PersonaAnalysis[] = Array.from(personaMap.entries())
    .sort((a, b) => {
      const ageA = parseInt(a[0])
      const ageB = parseInt(b[0])
      return ageA - ageB
    })
    .map(([age, count]) => ({
      age,
      count,
      percentage: Math.round((count / data.fail_count) * 100),
      sessionIds: sessionsByPersona.get(age) || [],
    }))

  // 영향받은 세션 목록
  const affectedSessions = data.affected_personas.map((persona) => ({
    sessionId: persona.session_id,
    personaAge: persona.persona_age,
  }))

  return {
    issueId,
    url: data.url,
    title: data.title,
    category: data.category,
    subCategory: data.subCategory,
    description: data.description,
    severity: mapSeverityToToken(data.severity),
    targetHtml: data.targetHtml,
    tags: data.tags,
    totalFailures: data.fail_count,
    failureRate: data.fail_rate * 100, // 퍼센트로 변환
    affectedUsersCount: data.fail_count,
    affectedUsersPercent: data.fail_rate * 100,
    personas,
    personaList: data.persona_ages,
    sessionIds: data.session_ids,
    affectedSessions,
  }
}

/**
 * ResultIssueViewModel을 기반으로 IssueDetailViewModel 생성
 * (실제 API에서 더 많은 데이터를 제공할 때 사용)
 */
export function mapResultIssueToDetailEnhanced(
  issue: ResultIssueViewModel,
  additionalData?: Partial<IssueDetailViewModel>
): IssueDetailViewModel {
  return {
    issueId: issue.issueId,
    url: additionalData?.url || issue.url,
    title: issue.title,
    category: issue.category,
    subCategory: additionalData?.subCategory || issue.subCategory,
    description: issue.description,
    severity: issue.severity,
    targetHtml: issue.selector,
    tags: issue.tags,
    totalFailures: issue.totalFailures,
    failureRate: issue.failureRate,
    affectedUsersCount: issue.affectedUsersCount,
    affectedUsersPercent: issue.affectedUsersPercent,
    personas: additionalData?.personas || [],
    personaList: additionalData?.personaList || issue.personaList,
    sessionIds: additionalData?.sessionIds || issue.sessionIds,
    affectedSessions: additionalData?.affectedSessions || issue.affectedSessions,
  }
}
