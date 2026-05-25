export interface SimulationStatusResponseDto {
  id: string
  status: string
  progress?: number
  currentStep?: string
  completed?: number
  total?: number
  failed?: number
  createdAt?: string
  updatedAt?: string
}
