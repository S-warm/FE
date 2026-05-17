import type {
  ApiHeatmapAgeGroup,
  ApiHeatmapErrorType,
  ApiIssueSeverity,
} from "@/types/api/common/enums"

export interface SimulationHeatmapBusinessPointDto {
  issueId: string
  url: string
  x: number
  y: number
  ageBand: string
  count: number
  severity: ApiIssueSeverity
  errorType: string
}

export interface SimulationHeatmapBusinessResponseDto {
  errorPoints: SimulationHeatmapBusinessPointDto[]
}

export interface SimulationHeatmapErrorBreakdownDto {
  timeout: number
  network: number
  console: number
}

export interface SimulationHeatmapErrorPointDto {
  x: number
  y: number
  count: number
  severity: ApiIssueSeverity
  errorType: ApiHeatmapErrorType
  affectedUsersCount: number
  blockRate: number
  repeatCount: number
  description: string
  errorBreakdown: SimulationHeatmapErrorBreakdownDto
  issueId: string
  ageBand: ApiHeatmapAgeGroup
}

export interface SimulationHeatmapPaginationDto {
  totalCount: number
  currentPage: number
  pageSize: number
  hasMore: boolean
}

export interface SimulationHeatmapPageDto {
  order: number
  pageName: string
  pageUrl: string
  screenshotUrl: string
  totalErrorCount: number
  currentAgeGroup: ApiHeatmapAgeGroup
  errorPoints: SimulationHeatmapErrorPointDto[]
  pagination: SimulationHeatmapPaginationDto
}

export interface SimulationHeatmapResponseDto {
  pages: SimulationHeatmapPageDto[]
}

export type SimulationHeatmapApiResponseDto =
  | SimulationHeatmapBusinessResponseDto
  | SimulationHeatmapResponseDto
