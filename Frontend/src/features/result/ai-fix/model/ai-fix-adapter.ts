import { buildResultPageId, resolveResultScreenshotUrl } from "@/features/result/shared/page-identity"
import type { BackendIssueSeverity, BackendSimulationAiFixResponse } from "@/shared/types/backend-api"

export type AiFixSeverityVariant = "high" | "medium" | "low"

export interface AiFixViewModelItem {
  id: string
  issueId: string
  title: string
  severity: AiFixSeverityVariant
  severityLabel: string
  affectedUsersCount: number
  beforeCode: string
  afterCode: string
  impactDescription: string
  changeDescription: string
}

export interface AiFixViewModelPage {
  id: string
  name: string
  screenshotUrl: string
  metaText: string
  fixes: AiFixViewModelItem[]
}

export interface AiFixViewModel {
  pages: AiFixViewModelPage[]
}

function mapFixSeverity(severity: BackendIssueSeverity): AiFixSeverityVariant {
  if (severity === "CRITICAL" || severity === "HIGH") return "high"
  if (severity === "MEDIUM") return "medium"
  return "low"
}

function mapSeverityLabel(severity: BackendIssueSeverity) {
  if (severity === "CRITICAL") return "치명적"
  if (severity === "HIGH") return "높음"
  if (severity === "MEDIUM") return "중간"
  return "낮음"
}

export function adaptAiFixResponse(response: BackendSimulationAiFixResponse): AiFixViewModel {
  const pages = [...response.pages]
    .sort((left, right) => left.order - right.order)
    .map((page) => ({
      id: buildResultPageId(page.order, page.pageName),
      name: page.pageName,
      screenshotUrl: resolveResultScreenshotUrl(page.screenshotUrl),
      metaText: `${page.totalFixCount} fix suggestions`,
      fixes: page.fixes.map((fix) => ({
        id: fix.issueId,
        issueId: fix.issueId,
        title: fix.title,
        severity: mapFixSeverity(fix.severity),
        severityLabel: mapSeverityLabel(fix.severity),
        affectedUsersCount: fix.affectedUsersCount,
        beforeCode: fix.beforeCode,
        afterCode: fix.afterCode,
        impactDescription: fix.impactDescription,
        changeDescription: fix.changeDescription,
      })),
    }))

  return { pages }
}
