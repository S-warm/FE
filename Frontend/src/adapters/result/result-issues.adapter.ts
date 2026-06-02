import { adaptIssueCategory } from "@/adapters/result/result-category.adapter"
import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import {
  deriveResultPageName,
  normalizeResultScreenshotUrl,
} from "@/adapters/result/result-page-meta.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import type {
  SimulationIssueDto,
  SimulationIssueAffectedPersonaDto,
  SimulationBusinessIssueDto,
  SimulationIssuesApiResponseDto,
  SimulationIssuesPageDto,
} from "@/types/api/simulation/simulation-issues.response"
import type { ResultIssueViewModel, ResultIssuesViewModel } from "@/types/view-model/result/result-issues"

function toPercentLabel(rate: number) {
  return Number((rate * 100).toFixed(1))
}

function mapBusinessIssueToViewModel(issue: SimulationBusinessIssueDto): ResultIssueViewModel {
  const affectedUsersCount = issue.affected_personas.length || issue.session_ids.length
  const failureRate = toPercentLabel(issue.fail_rate)

  // affected_personas에서 연령대 추출 (중복 제거)
  const personaAges = [...new Set(issue.affected_personas.map((p) => p.persona_age))]

  return {
    issueType: "ux",
    issueId:
      issue.issueId ??
      `${issue.url}:${issue.title}:${issue.targetHtml}`.toLowerCase().replace(/\s+/g, "-"),
    title: issue.title,
    url: issue.url,
    category: adaptIssueCategory(issue.category),
    subCategory: issue.subCategory ?? "",
    severity: adaptIssueSeverity(issue.severity),
    totalFailures: issue.fail_count,
    failureRate,
    affectedUsersCount,
    affectedUsersPercent: failureRate,
    description: issue.description,
    selector: issue.targetHtml,
    tags: issue.tags,
    personaList: personaAges,
    sessionIds: issue.session_ids,
    affectedSessions: issue.affected_personas.map((persona) => ({
      sessionId: persona.session_id,
      personaAge: persona.persona_age,
    })),
    expectedBenefit: null,
  }
}

function mapLegacyIssueToViewModel(issue: SimulationIssuesPageDto["issues"][number], pageUrl?: string): ResultIssueViewModel {
  const totalFailures = issue.failCount ?? issue.affectedUsersCount

  const affectedSessions = issue.affected_personas?.map((persona: SimulationIssueAffectedPersonaDto) => ({
    sessionId: persona.session_id,
    personaAge: persona.persona_age,
  })) ?? []

  // 연령대 목록 추출 (중복 제거)
  const personaAges = [...new Set(affectedSessions.map((s) => s.personaAge))]

  return {
    issueType: "ux",
    issueId: issue.issueId,
    title: issue.title,
    url: pageUrl ?? "",
    category: adaptIssueCategory(issue.category),
    subCategory: issue.subCategory ?? "",
    severity: adaptIssueSeverity(issue.severity),
    totalFailures,
    failureRate: issue.failRate != null ? Number((issue.failRate * 100).toFixed(1)) : (issue.affectedUsersPercent ?? 0),
    affectedUsersCount: issue.affectedUsersCount,
    affectedUsersPercent: issue.affectedUsersPercent,
    description: issue.description,
    selector: issue.targetHtml,
    tags: issue.tags,
    personaList: personaAges,
    sessionIds: affectedSessions.map((s: { sessionId: string; personaAge: string }) => s.sessionId),
    affectedSessions,
    expectedBenefit: null,
  }
}

function adaptBusinessIssues(
  simulationId: string,
  raw: Extract<SimulationIssuesApiResponseDto, { total_issues: number }>
): ResultIssuesViewModel {
  const issuesByUrl = raw.issues.reduce<Map<string, SimulationBusinessIssueDto[]>>((acc, issue) => {
    const bucket = acc.get(issue.url) ?? []
    bucket.push(issue)
    acc.set(issue.url, bucket)
    return acc
  }, new Map())

  return {
    pages: Array.from(issuesByUrl.entries()).map(([url, issues], index) => {
      const firstIssue = issues[0]
      const pageName = deriveResultPageName(url, firstIssue.pageName)

      return {
        ...createResultPageSummary({
          simulationId,
          order: index + 1,
          pageName,
          pageUrl: url,
          screenshotUrl: normalizeResultScreenshotUrl(firstIssue.screenshotUrl),
          totalCount: issues.length,
          totalCountType: "issues",
          metaText: `${issues.length}건 이슈`,
        }),
        issues: issues.map(mapBusinessIssueToViewModel),
      }
    }),
  }
}

function adaptLegacyPages(
  simulationId: string,
  raw: Extract<SimulationIssuesApiResponseDto, { pages: SimulationIssuesPageDto[] }>
): ResultIssuesViewModel {
  return {
    pages: raw.pages.map((page) => ({
      ...createResultPageSummary({
        simulationId,
        order: page.order,
        pageName: deriveResultPageName(page.pageUrl, page.pageName),
        pageUrl: page.pageUrl,
        screenshotUrl: normalizeResultScreenshotUrl(page.screenshotUrl),
        totalCount: page.totalIssueCount,
        totalCountType: "issues",
        metaText: `${page.totalIssueCount}건 이슈`,
      }),
      issues: page.issues.map((issue: SimulationIssueDto) => mapLegacyIssueToViewModel(issue, page.pageUrl)),
    })),
  }
}

export function adaptIssuesResponseToViewModel(
  simulationId: string,
  raw: SimulationIssuesApiResponseDto
): ResultIssuesViewModel {
  if ("total_issues" in raw && Array.isArray(raw.issues)) {
    return adaptBusinessIssues(simulationId, raw)
  }

  if ("pages" in raw && Array.isArray(raw.pages)) {
    return adaptLegacyPages(simulationId, raw)
  }

  return { pages: [] }
}
