import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptWcagSeverity } from "@/adapters/result/result-severity.adapter"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
import type {
  SimulationWcagApiResponseDto,
  SimulationWcagBusinessUrlResultDto,
  SimulationWcagFlatResponseDto,
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
      label: "심각",
      description: "즉시 수정이 필요한 문제",
    },
    {
      severity: adaptWcagSeverity("Moderate"),
      count: input.moderate,
      label: "중요",
      description: "접근성 저하를 유발하는 문제",
    },
    {
      severity: adaptWcagSeverity("Minor"),
      count: input.minor,
      label: "경미",
      description: "개선 시 품질이 높아지는 문제",
    },
  ]
}

function resolvePageName(url: string) {
  if (url.includes("/search")) return "검색 결과"
  if (url.includes("/articleDetail")) return "논문 상세"
  if (url.includes("/journal")) return "저널 상세"
  if (url.includes("/login")) return "로그인"
  if (url.includes("/signup")) return "회원가입"
  return "상세 페이지"
}

function resolveScreenshotUrl(url: string) {
  if (url.includes("/search")) return getResultPageScreenshotUrl("search")
  if (url.includes("/articleDetail") || url.includes("/journal")) {
    return getResultPageScreenshotUrl("product")
  }
  if (url.includes("/login")) return getResultPageScreenshotUrl("login")
  if (url.includes("/signup")) return getResultPageScreenshotUrl("signup")
  return getResultPageScreenshotUrl()
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

function toBusinessPages(
  simulationId: string,
  raw: Extract<SimulationWcagApiResponseDto, { urls: Record<string, SimulationWcagBusinessUrlResultDto> }>
): ResultWcagViewModel {
  const entries = Object.entries(raw.urls)

  return {
    pages: entries.map(([url, result], index) => {
      const issues = result.violations.map((violation) => ({
        issueType: "wcag" as const,
        wcagIssueId: violation.wcagIssueId,
        title: violation.title,
        severity: adaptWcagSeverity(violation.severity),
        description: violation.description,
        htmlElement: violation.html,
        wcagCriteria: violation.wcag_criteria,
      }))

      return {
        ...createResultPageSummary({
          simulationId,
          order: index + 1,
          pageName: resolvePageName(url),
          pageUrl: url,
          screenshotUrl: resolveScreenshotUrl(url),
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

function toLegacyPages(
  simulationId: string,
  raw: Extract<SimulationWcagApiResponseDto, SimulationWcagResponseDto>
): ResultWcagViewModel {
  const issues = raw.issues.map((issue) => ({
    issueType: "wcag" as const,
    wcagIssueId: issue.wcagIssueId,
    title: issue.title,
    severity: adaptWcagSeverity(issue.severity),
    description: issue.description,
    htmlElement: issue.selector,
    wcagCriteria: undefined,
  }))

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
  const issues = raw.issues.map((issue) => ({
    issueType: "wcag" as const,
    wcagIssueId: issue.wcagIssueId,
    title: issue.title,
    severity: adaptWcagSeverity(issue.severity),
    description: issue.description,
    htmlElement: issue.html ?? issue.selector,
    wcagCriteria: issue.wcagCriteria ?? issue.wcag_criteria,
  }))

  return {
    pages: [
      {
        ...createResultPageSummary({
          simulationId,
          order: 1,
          pageName: "?꾩껜 ?섏씠吏",
          pageUrl: undefined,
          screenshotUrl: undefined,
          totalCount: issues.length,
          totalCountType: "wcag-issues",
          metaText: `${issues.length}건 WCAG 이슈`,
        }),
        summary: deriveSummaryFromViolations(raw.score, raw.wcagLabel, issues.length),
        distribution: buildDistributionItems({
          critical: raw.distributionCritical,
          moderate: raw.distributionModerate,
          minor: raw.distributionMinor,
        }),
        issues,
      },
    ],
  }
}

export function adaptWcagResponseToViewModel(
  simulationId: string,
  raw: SimulationWcagApiResponseDto
): ResultWcagViewModel {
  if ("urls" in raw && raw.urls) {
    return toBusinessPages(simulationId, raw)
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
