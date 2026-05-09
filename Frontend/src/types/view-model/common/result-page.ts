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
  totalCountType?: "issues" | "fixes" | "errors" | "wcag-issues"
  metaText?: string
}
