export interface SeverityTokenViewModel {
  raw: string
  tone: "error" | "warning" | "info" | "neutral"
  label: string
  rank: number
}
