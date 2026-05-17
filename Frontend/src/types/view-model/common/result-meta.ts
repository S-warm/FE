export type ResultAgeBand = "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대"
export type ResultAgeFilter = "all" | ResultAgeBand

export type ResultCountType = "issues" | "fixes" | "errors" | "wcag-issues"

export interface ResultCountSummaryViewModel {
  totalCount: number
  totalCountType: ResultCountType
  metaText?: string
}
