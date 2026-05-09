import type { ApiDigitalLiteracy, ApiPersonaDevice } from "@/types/api/common/enums"

export interface SimulationCreateRequestDto {
  title: string
  targetUrl: string
  digitalLiteracy: ApiDigitalLiteracy
  successCondition: string
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
