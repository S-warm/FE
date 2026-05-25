export type SimulationFormPersonaDevice =
  | "mac"
  | "windows"
  | "iphone"
  | "android"
  | "ipad"
  | "android_tablet"

export type SimulationFormDigitalLiteracy = "high" | "medium" | "low"

export interface SimulationFormAgeCounts {
  teens: number
  twenties: number
  thirties: number
  forties: number
  fifties: number
  sixties: number
  seventies: number
}

export interface SimulationFormViewModel {
  projectTitle: string
  targetUrl: string
  endUrl: string
  task: string
  digitalLiteracy: SimulationFormDigitalLiteracy
  personaDevice: SimulationFormPersonaDevice
  ageCounts: SimulationFormAgeCounts
  visionImpairment: number
  attentionLevel: number
}
