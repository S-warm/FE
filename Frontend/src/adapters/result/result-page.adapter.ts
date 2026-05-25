import type { ResultPageBaseViewModel, ResultPageSummaryViewModel } from "@/types/view-model/common/result-page"
import type { ResultCountType } from "@/types/view-model/common/result-meta"

function normalizePageKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "")
}

export function createResultPageId(params: {
  simulationId: string
  order: number
  pageName: string
  pageUrl?: string
}) {
  const base = params.pageUrl?.trim() || params.pageName
  return `${params.simulationId}:${params.order}:${normalizePageKey(base)}`
}

export function createResultPageBase(params: {
  simulationId: string
  order: number
  pageName: string
  pageUrl?: string
  screenshotUrl?: string
}): ResultPageBaseViewModel {
  return {
    simulationId: params.simulationId,
    pageId: createResultPageId(params),
    order: params.order,
    pageName: params.pageName,
    pageUrl: params.pageUrl,
    screenshotUrl: params.screenshotUrl,
  }
}

export function createResultPageSummary(params: {
  simulationId: string
  order: number
  pageName: string
  pageUrl?: string
  screenshotUrl?: string
  totalCount?: number
  totalCountType?: ResultCountType
  metaText?: string
}): ResultPageSummaryViewModel {
  return {
    ...createResultPageBase(params),
    totalCount: params.totalCount,
    totalCountType: params.totalCountType,
    metaText: params.metaText,
  }
}
