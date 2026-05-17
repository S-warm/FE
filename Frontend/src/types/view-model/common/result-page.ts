import type { ResultCountType } from "@/types/view-model/common/result-meta"

export interface ResultPageBaseViewModel {
  simulationId: string
  pageId: string
  order: number
  pageName: string
  pageUrl?: string
  screenshotUrl?: string
}

export interface ResultPageSummaryViewModel extends ResultPageBaseViewModel {
  totalCount?: number
  totalCountType?: ResultCountType
  metaText?: string
}
