export interface SimulationStatusResponseDto {
  id: string
  status: string
  progress?: number
  currentStep?: string
  createdAt?: string
  updatedAt?: string
}
