import type { ApiDigitalLiteracy, ApiPersonaDevice } from "@/types/api/common/enums"

export interface SimulationSuccessConditionRequestDto {
  path: string
  requiredParams: Record<string, string>
}

export interface SimulationCreateRequestDto {
  title: string
  task: string
  targetUrl: string
  digitalLiteracy: ApiDigitalLiteracy
  successCondition: SimulationSuccessConditionRequestDto
  personaDevice: ApiPersonaDevice
  ageCount10: number
  ageCount20: number
  ageCount30: number
  ageCount40: number
  ageCount50: number
  ageCount60: number
  ageCount70: number
  visionImpairment?: number | null
  attentionLevel?: number | null
}
