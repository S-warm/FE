export interface DonutChartDatumViewModel {
  name: string
  value: number
  color?: string
}

export interface BarChartDatumViewModel {
  label: string
  score: number
  color?: string
}

export interface LineChartDatumViewModel {
  label: string
  value: number
}

export interface HeatmapCellViewModel {
  id: string
  value: number
}
