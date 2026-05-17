import { adaptIssueCategory } from "@/adapters/result/result-category.adapter"
import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
import type {
  SimulationBusinessIssueDto,
  SimulationIssuesApiResponseDto,
  SimulationIssuesPageDto,
} from "@/types/api/simulation/simulation-issues.response"
import type { ResultIssueViewModel, ResultIssuesViewModel } from "@/types/view-model/result/result-issues"

function resolvePageNameFromUrl(url: string) {
  if (url.includes("/search")) return "검색 결과"
  if (url.includes("/articleDetail")) return "논문 상세"
  if (url.includes("/journal")) return "저널 상세"
  if (url.includes("/login")) return "로그인"
  if (url.includes("/signup")) return "회원가입"
  return "상세 페이지"
}

function resolveScreenshotUrl(url: string, screenshotUrl?: string) {
  if (screenshotUrl?.trim()) {
    return screenshotUrl
  }

  if (url.includes("/search")) return getResultPageScreenshotUrl("search")
  if (url.includes("/articleDetail") || url.includes("/journal")) {
    return getResultPageScreenshotUrl("product")
  }
  if (url.includes("/login")) return getResultPageScreenshotUrl("login")
  if (url.includes("/signup")) return getResultPageScreenshotUrl("signup")
  return getResultPageScreenshotUrl()
}

function toPercentLabel(rate: number) {
  return Number((rate * 100).toFixed(1))
}

function mapBusinessIssueToViewModel(issue: SimulationBusinessIssueDto): ResultIssueViewModel {
  const affectedUsersCount = issue.affected_personas.length || issue.session_ids.length
  const failureRate = toPercentLabel(issue.fail_rate)

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
    personaList: issue.persona_ages,
    sessionIds: issue.session_ids,
    affectedSessions: issue.affected_personas.map((persona) => ({
      sessionId: persona.session_id,
      personaAge: persona.persona_age,
    })),
    expectedBenefit: null,
  }
}

function mapLegacyIssueToViewModel(issue: SimulationIssuesPageDto["issues"][number]): ResultIssueViewModel {
  return {
    issueType: "ux",
    issueId: issue.issueId,
    title: issue.title,
    url: "",
    category: adaptIssueCategory(issue.category),
    subCategory: "",
    severity: adaptIssueSeverity(issue.severity),
    totalFailures: issue.affectedUsersCount,
    failureRate: issue.affectedUsersPercent,
    affectedUsersCount: issue.affectedUsersCount,
    affectedUsersPercent: issue.affectedUsersPercent,
    description: issue.description,
    selector: issue.targetHtml,
    tags: issue.tags,
    personaList: [],
    sessionIds: [],
    affectedSessions: [],
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
      const pageName = firstIssue.pageName?.trim() || resolvePageNameFromUrl(url)

      return {
        ...createResultPageSummary({
          simulationId,
          order: index + 1,
          pageName,
          pageUrl: url,
          screenshotUrl: resolveScreenshotUrl(url, firstIssue.screenshotUrl),
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
        pageName: page.pageName,
        pageUrl: page.pageUrl,
        screenshotUrl: page.screenshotUrl,
        totalCount: page.totalIssueCount,
        totalCountType: "issues",
        metaText: `${page.totalIssueCount}건 이슈`,
      }),
      issues: page.issues.map(mapLegacyIssueToViewModel),
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
