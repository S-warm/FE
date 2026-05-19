import { createResultPageSummary } from "@/adapters/result/result-page.adapter"
import { adaptIssueSeverity } from "@/adapters/result/result-severity.adapter"
import { getResultPageScreenshotUrl } from "@/features/result/assets"
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
          pageName: resolvePageName(raw.url),
          pageUrl: raw.url,
          screenshotUrl: resolveScreenshotUrl(raw.url),
          totalCount: raw.fixes.length,
          totalCountType: "fixes",
          metaText: `${raw.fixes.length}건 수정안`,
        }),
        fixes: raw.fixes.map((fix, index) => ({
          issueType: "ux" as const,
          issueId: `ai-fix-${index + 1}`,
          title: fix.issue_title,
          severity: adaptIssueSeverity(normalizeSeverity(fix.severity)),
          impactedUsersCount: fix.affectedUsersCount ?? 0,
          beforeCode: fix.before,
          afterCode: fix.after,
          impactSummary: fix.impact,
          changeSummaryTitle: "무엇이 변경되었나",
          changeSummaryBody: fix.description,
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
        pageName: page.pageName,
        pageUrl: page.pageUrl,
        screenshotUrl: page.screenshotUrl,
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
