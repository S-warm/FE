import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import {
  deriveResultPageName,
  normalizeResultScreenshotUrl,
} from "@/adapters/result/result-page-meta.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import type {
  SimulationAiFixApiResponseDto,
  SimulationAiFixBusinessItemDto,
  SimulationAiFixResponseDto,
} from "@/types/api/simulation/simulation-ai-fix.response"
import type { ResultAiFixViewModel } from "@/types/view-model/result/result-ai-fix"

function normalizeSeverity(
  severity?: SimulationAiFixBusinessItemDto["severity"],
) {
  const normalized = String(severity ?? "").trim().toUpperCase()

  if (normalized === "CRITICAL") return "CRITICAL" as const
  if (normalized === "HIGH") return "HIGH" as const
  if (normalized === "MEDIUM") return "MEDIUM" as const
  if (normalized === "LOW") return "LOW" as const
  return null
}

function resolveFixTitle(fix: SimulationAiFixBusinessItemDto, index: number) {
  const candidateTitles = [
    "issueTitle" in fix ? fix.issueTitle : undefined,
    "issue_title" in fix ? fix.issue_title : undefined,
    "title" in fix ? fix.title : undefined,
    fix.changeDescription?.split("\n")[0],
    fix.selector,
  ]

  for (const candidate of candidateTitles) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }

  return `수정 제안 ${index + 1}`
}

function toBusinessPage(
  simulationId: string,
  raw: Extract<SimulationAiFixApiResponseDto, { url: string }>
): ResultAiFixViewModel {
  return {
    pages: [
      {
        ...createResultPageSummary({
          simulationId,
          order: 1,
          pageName: deriveResultPageName(raw.url),
          pageUrl: raw.url,
          screenshotUrl: normalizeResultScreenshotUrl(raw.screenshotUrl),
          totalCount: raw.fixes.length,
          totalCountType: "fixes",
          metaText: `${raw.fixes.length}건 수정`,
        }),
        fixes: raw.fixes.map((fix, index) => ({
          issueType: "ux" as const,
          issueId:
            ("issueId" in fix && typeof fix.issueId === "string" && fix.issueId.trim()) ||
            `ai-fix-${index + 1}`,
          title: resolveFixTitle(fix, index),
          severity: adaptIssueSeverity(normalizeSeverity(fix.severity)),
          impactedUsersCount: fix.affectedUsersCount ?? 0,
          beforeCode: fix.beforeCode,
          afterCode: fix.afterCode,
          impactSummary: fix.impactDescription,
          changeSummaryTitle: "코드 변경 요약",
          changeSummaryBody: fix.changeDescription,
        })),
      },
    ],
  }
}

function toLegacyPages(
  simulationId: string,
  raw: Extract<SimulationAiFixApiResponseDto, SimulationAiFixResponseDto>
): ResultAiFixViewModel {
  return {
    pages: raw.pages.map((page) => ({
      ...createResultPageSummary({
        simulationId,
        order: page.order,
        pageName: deriveResultPageName(page.pageUrl, page.pageName),
        pageUrl: page.pageUrl,
        screenshotUrl: normalizeResultScreenshotUrl(page.screenshotUrl),
        totalCount: page.totalFixCount,
        totalCountType: "fixes",
        metaText: `${page.totalFixCount}건 수정 제안`,
      }),
      fixes: page.fixes.map((fix) => ({
        issueType: "ux" as const,
        issueId: fix.issueId,
        title: fix.title,
        severity: adaptIssueSeverity(fix.severity),
        impactedUsersCount: fix.affectedUsersCount,
        beforeCode: fix.beforeCode,
        afterCode: fix.afterCode,
        impactSummary: fix.impactDescription,
        changeSummaryTitle: "코드 변경 요약",
        changeSummaryBody: fix.changeDescription,
      })),
    })),
  }
}

export function adaptAiFixResponseToViewModel(
  simulationId: string,
  raw: SimulationAiFixApiResponseDto
): ResultAiFixViewModel {
  if ("url" in raw && Array.isArray(raw.fixes)) {
    return toBusinessPage(simulationId, raw)
  }

  if ("pages" in raw && Array.isArray(raw.pages)) {
    return toLegacyPages(simulationId, raw)
  }

  return { pages: [] }
}
