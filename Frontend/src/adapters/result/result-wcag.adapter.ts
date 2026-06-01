import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import {
  deriveResultPageName,
  normalizeResultScreenshotUrl,
} from "@/adapters/result/result-page-meta.adapter"
import { adaptWcagSeverity } from "@/adapters/result/result-severity.adapter"
import type {
  SimulationWcagApiResponseDto,
  SimulationWcagBusinessUrlResultDto,
  SimulationWcagFlatResponseDto,
  SimulationWcagPageDto,
  SimulationWcagPagesResponseDto,
  SimulationWcagResponseDto,
} from "@/types/api/simulation/simulation-wcag.response"
import type { ResultWcagDistributionItemViewModel } from "@/types/view-model/result/result-wcag"
import type { ResultWcagViewModel } from "@/types/view-model/result/result-wcag"

function buildDistributionItems(input: {
  critical: number
  moderate: number
  minor: number
}): ResultWcagDistributionItemViewModel[] {
  return [
    {
      severity: adaptWcagSeverity("Critical"),
      count: input.critical,
      label: "치명",
      description: "즉시 수정이 필요한 문제",
    },
    {
      severity: adaptWcagSeverity("Moderate"),
      count: input.moderate,
      label: "보통",
      description: "접근성 저하를 유발하는 문제",
    },
    {
      severity: adaptWcagSeverity("Minor"),
      count: input.minor,
      label: "낮음",
      description: "개선 여지가 있지만 영향이 낮은 문제",
    },
  ]
}

function deriveSummaryFromViolations(
  score: number,
  wcagLabel: string,
  issuesCount: number
) {
  const foundIssues = issuesCount
  const totalTests = Math.max(foundIssues + 8, 12)
  const passedTests = Math.max(0, Math.round(totalTests * (score / 100)))

  return {
    complianceScore: score,
    wcagLabel,
    totalTests,
    passedTests,
    foundIssues,
  }
}

function mapIssues(
  issues: Array<{
    wcagIssueId: string
    title: string
    severity: string
    description: string
    html?: string
    selector?: string
    wcagCriteria?: string
    wcag_criteria?: string
  }>
) {
  return issues.map((issue) => ({
    issueType: "wcag" as const,
    wcagIssueId: issue.wcagIssueId,
    title: issue.title,
    severity: adaptWcagSeverity(issue.severity),
    description: issue.description,
    htmlElement: issue.html ?? issue.selector,
    wcagCriteria: issue.wcagCriteria ?? issue.wcag_criteria,
  }))
}

function toBusinessPages(
  simulationId: string,
  raw: Extract<SimulationWcagApiResponseDto, { urls: Record<string, SimulationWcagBusinessUrlResultDto> }>
): ResultWcagViewModel {
  const entries = Object.entries(raw.urls)

  return {
    pages: entries.map(([url, result], index) => {
      const issues = mapIssues(
        result.violations.map((violation) => ({
          ...violation,
          selector: undefined,
          wcagCriteria: undefined,
        }))
      )

      return {
        ...createResultPageSummary({
          simulationId,
          order: index + 1,
          pageName: deriveResultPageName(url),
          pageUrl: url,
          screenshotUrl: undefined,
          totalCount: issues.length,
          totalCountType: "wcag-issues",
          metaText: `${issues.length}건 WCAG 이슈`,
        }),
        summary: deriveSummaryFromViolations(
          result.score,
          result.wcagLabel,
          issues.length
        ),
        distribution: buildDistributionItems({
          critical: result.distribution.Critical,
          moderate: result.distribution.Moderate,
          minor: result.distribution.Minor,
        }),
        issues,
      }
    }),
  }
}

function toPageListResponse(
  simulationId: string,
  raw: SimulationWcagPagesResponseDto
): ResultWcagViewModel {
  return {
    pages: raw.pages.map((page: SimulationWcagPageDto) => {
      const issues = mapIssues(page.issues)
      const summary =
        page.summary ??
        deriveSummaryFromViolations(
          page.score ?? 100,
          page.wcagLabel ?? "AA",
          issues.length
        )

      const critical =
        page.distribution?.critical ??
        page.distributionCritical ??
        issues.filter((issue) => issue.severity.rank === 3).length
      const moderate =
        page.distribution?.moderate ??
        page.distributionModerate ??
        issues.filter((issue) => issue.severity.rank === 2).length
      const minor =
        page.distribution?.minor ??
        page.distributionMinor ??
        issues.filter((issue) => issue.severity.rank === 1).length

      return {
        ...createResultPageSummary({
          simulationId,
          order: page.order,
          pageName: deriveResultPageName(page.pageUrl, page.pageName),
          pageUrl: page.pageUrl,
          screenshotUrl: normalizeResultScreenshotUrl(page.screenshotUrl),
          totalCount:
            page.totalIssueCount ??
            page.totalWcagIssueCount ??
            issues.length,
          totalCountType: "wcag-issues",
          metaText: `${page.totalIssueCount ?? page.totalWcagIssueCount ?? issues.length}건 WCAG 이슈`,
        }),
        summary,
        distribution: buildDistributionItems({
          critical,
          moderate,
          minor,
        }),
        issues,
      }
    }),
  }
}

function toLegacyPages(
  simulationId: string,
  raw: Extract<SimulationWcagApiResponseDto, SimulationWcagResponseDto>
): ResultWcagViewModel {
  const issues = mapIssues(raw.issues)

  return {
    pages: [
      {
        ...createResultPageSummary({
          simulationId,
          order: 1,
          pageName: "전체 페이지",
          pageUrl: undefined,
          screenshotUrl: undefined,
          totalCount: raw.summary.foundIssues,
          totalCountType: "wcag-issues",
          metaText: `${raw.summary.foundIssues}건 WCAG 이슈`,
        }),
        summary: raw.summary,
        distribution: buildDistributionItems({
          critical: raw.distribution.critical,
          moderate: raw.distribution.moderate,
          minor: raw.distribution.minor,
        }),
        issues,
      },
    ],
  }
}

function toFlatPages(
  simulationId: string,
  raw: Extract<SimulationWcagApiResponseDto, SimulationWcagFlatResponseDto>
): ResultWcagViewModel {
  const issues = mapIssues(raw.issues)
  const pagesByUrl = new Map<string, typeof issues>()

  raw.issues.forEach((rawIssue) => {
    const url = rawIssue.url || "unknown"
    const mappedIssue = issues.find((i) => i.wcagIssueId === rawIssue.wcagIssueId)
    if (mappedIssue) {
      if (!pagesByUrl.has(url)) {
        pagesByUrl.set(url, [])
      }
      pagesByUrl.get(url)?.push(mappedIssue)
    }
  })

  const pageEntries = Array.from(pagesByUrl.entries())
  if (pageEntries.length === 0 || (pageEntries.length === 1 && pageEntries[0][0] === "unknown")) {
    const pageCount = 3
    const issuesPerPage = Math.ceil(issues.length / pageCount)
    const simulatedPages = Array.from({ length: pageCount }, (_, index) => {
      const start = index * issuesPerPage
      const end = Math.min(start + issuesPerPage, issues.length)
      const pageIssues = issues.slice(start, end)
      const pageDistribution = {
        critical: pageIssues.filter((i) => i.severity.rank === 3).length,
        moderate: pageIssues.filter((i) => i.severity.rank === 2).length,
        minor: pageIssues.filter((i) => i.severity.rank === 1).length,
      }
      const pageScore = Math.max(
        0,
        Math.round(raw.score - (pageDistribution.critical * 10 + pageDistribution.moderate * 5))
      )
      return {
        ...createResultPageSummary({
          simulationId,
          order: index + 1,
          pageName: `페이지 ${index + 1}`,
          pageUrl: `[임시] 페이지 ${index + 1}`,
          screenshotUrl: undefined,
          totalCount: pageIssues.length,
          totalCountType: "wcag-issues",
          metaText: `${pageIssues.length}건 WCAG 이슈`,
        }),
        summary: deriveSummaryFromViolations(pageScore, raw.wcagLabel, pageIssues.length),
        distribution: buildDistributionItems({
          critical: pageDistribution.critical,
          moderate: pageDistribution.moderate,
          minor: pageDistribution.minor,
        }),
        issues: pageIssues,
      }
    })
    return { pages: simulatedPages }
  }

  const simulatedPages = pageEntries.map(([url, pageIssues], index) => {
    const pageDistribution = {
      critical: pageIssues.filter((i) => i.severity.rank === 3).length,
      moderate: pageIssues.filter((i) => i.severity.rank === 2).length,
      minor: pageIssues.filter((i) => i.severity.rank === 1).length,
    }
    const pageScore = Math.max(0, Math.round(raw.score * 0.95))
    return {
      ...createResultPageSummary({
        simulationId,
        order: index + 1,
        pageName: deriveResultPageName(url),
        pageUrl: url,
        screenshotUrl: undefined,
        totalCount: pageIssues.length,
        totalCountType: "wcag-issues",
        metaText: `${pageIssues.length}건 WCAG 이슈`,
      }),
      summary: deriveSummaryFromViolations(pageScore, raw.wcagLabel, pageIssues.length),
      distribution: buildDistributionItems({
        critical: pageDistribution.critical,
        moderate: pageDistribution.moderate,
        minor: pageDistribution.minor,
      }),
      issues: pageIssues,
    }
  })

  return { pages: simulatedPages }
}

export function adaptWcagResponseToViewModel(
  simulationId: string,
  raw: SimulationWcagApiResponseDto
): ResultWcagViewModel {
  if ("urls" in raw && raw.urls) {
    return toBusinessPages(simulationId, raw)
  }

  if ("pages" in raw && Array.isArray(raw.pages)) {
    return toPageListResponse(simulationId, raw)
  }

  if ("summary" in raw && "distribution" in raw && Array.isArray(raw.issues)) {
    return toLegacyPages(simulationId, raw)
  }

  if (
    "score" in raw &&
    "wcagLabel" in raw &&
    "distributionCritical" in raw &&
    "distributionModerate" in raw &&
    "distributionMinor" in raw &&
    Array.isArray(raw.issues)
  ) {
    return toFlatPages(simulationId, raw)
  }

  return { pages: [] }
}

