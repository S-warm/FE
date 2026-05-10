export type SimulationStatusValue =
  | "pending"
  | "running"
  | "completed"
  | "failed"

export interface SimulationStatusViewModel {
  status: SimulationStatusValue
  progress: number
  activeStepIndex: number
  message?: string
}
