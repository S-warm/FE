export type BackendSimulationStatus = "pending" | "running" | "completed" | "failed"
export type BackendDigitalLiteracy = "high" | "medium" | "low"
export type BackendPersonaDevice = "desktop" | "mobile" | "tablet"
export type BackendIssueSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
export type BackendWcagSeverity = "Critical" | "Moderate" | "Minor"
export type BackendOverviewAgeKey =
  | "10대"
  | "20대"
  | "30대"
  | "40대"
  | "50대"
  | "60대"
  | "70대"
  | "80대"
export type BackendHeatmapAgeGroup =
  | "all"
  | "10대"
  | "20대"
  | "30대"
  | "40대"
  | "50대"
  | "60대"
  | "70대"
  | "80대"

export interface BackendSimulationCreateRequest {
  title: string
  targetUrl: string
  personaCount: number
  digitalLiteracy: BackendDigitalLiteracy
  successCondition: string
  personaDevice: BackendPersonaDevice
  ageRatioTeen: number
  ageRatioFifty: number
  ageRatioEighty: number
  visionImpairment?: number
  attentionLevel?: number
}

export interface BackendSimulationListItem {
  id: string
  title: string
  status: BackendSimulationStatus
  createdAt: string
}

export type BackendSimulationCreateResponse = BackendSimulationListItem

export interface BackendOverviewAgeGroup {
  entered: number
  passed: number
  dropOff: number
  successRate: number
}

export interface BackendOverviewFunnelPanel {
  order: number
  pageName: string
  pageUrl: string
  totalEntered: number
  totalPassed: number
  panelSuccessRate: number
  avgTimeSeconds: number
  agentsByAge: Record<BackendOverviewAgeKey, BackendOverviewAgeGroup>
}

export interface BackendSimulationOverviewResponse {
  summary: {
    taskSuccessRate: number
    totalAgents: number
    avgCompletionSeconds: number
    dropOffAgents: number
  }
  funnelPanels: BackendOverviewFunnelPanel[]
}

export interface BackendIssue {
  issueId: string
  title: string
  category: string
  severity: BackendIssueSeverity
  affectedUsersCount: number
  affectedUsersPercent: number
  description: string
  targetHtml: string
  tags: string[]
}

export interface BackendIssuePageGroup {
  order: number
  pageName: string
  pageUrl: string
  screenshotUrl: string
  totalIssueCount: number
  issues: BackendIssue[]
}

export interface BackendSimulationIssuesResponse {
  pages: BackendIssuePageGroup[]
}

export interface BackendAiFix {
  issueId: string
  title: string
  severity: BackendIssueSeverity
  affectedUsersCount: number
  beforeCode: string
  afterCode: string
  impactDescription: string
  changeDescription: string
}

export interface BackendAiFixPageGroup {
  order: number
  pageName: string
  pageUrl: string
  screenshotUrl: string
  totalFixCount: number
  fixes: BackendAiFix[]
}

export interface BackendSimulationAiFixResponse {
  pages: BackendAiFixPageGroup[]
}

export interface BackendHeatmapErrorPoint {
  x: number
  y: number
  count: number
  severity: BackendIssueSeverity
  errorType: "Timeout" | "Network" | "Console"
  affectedUsersCount: number
  blockRate: number
  repeatCount: number
  description: string
  errorBreakdown: {
    timeout: number
    network: number
    console: number
  }
  issueId: string | null
  ageBand: BackendHeatmapAgeGroup
}

export interface BackendHeatmapPageGroup {
  order: number
  pageName: string
  pageUrl: string
  screenshotUrl: string
  totalErrorCount: number
  errorPoints: BackendHeatmapErrorPoint[]
  currentAgeGroup: BackendHeatmapAgeGroup
  pagination: {
    totalCount: number
    currentPage: number
    pageSize: number
    hasMore: boolean
  }
}

export interface BackendSimulationHeatmapResponse {
  pages: BackendHeatmapPageGroup[]
}

export interface BackendSimulationWcagPageGroup {
  order: number
  pageName: string
  pageUrl: string
  screenshotUrl: string
  summary: {
    complianceScore: number
    wcagLabel: string
    totalTests: number
    passedTests: number
    foundIssues: number
  }
  distribution: {
    critical: number
    moderate: number
    minor: number
  }
  issues: Array<{
    wcagIssueId: number
    title: string
    severity: BackendWcagSeverity
    description: string
  }>
}

export interface BackendSimulationWcagPagesResponse {
  pages: BackendSimulationWcagPageGroup[]
}

export interface BackendSimulationWcagAggregateResponse {
  summary: {
    complianceScore: number
    wcagLabel: string
    totalTests: number
    passedTests: number
    foundIssues: number
  }
  distribution: {
    critical: number
    moderate: number
    minor: number
  }
  issues: Array<{
    wcagIssueId: number
    title: string
    severity: BackendWcagSeverity
    description: string
  }>
}
