import type { PersonaDevice } from "@/constants/persona-device"
import type { AgeRatios, DigitalLiteracyLevel } from "@/features/simulation-setup/model/types"
import type {
  BackendPersonaDevice,
  BackendSimulationCreateRequest,
} from "@/shared/types/backend-api"

export interface SimulationSetupDraftValues {
  projectTitle: string
  targetUrl: string
  personaCount: number
  digitalLiteracy: DigitalLiteracyLevel
  successCondition: string
  personaDevice: PersonaDevice
  ageRatios: AgeRatios
  visionImpairment: number | null
  attentionLevel: number | null
}

export function mapPersonaDeviceToBackend(value: PersonaDevice): BackendPersonaDevice {
  if (value === "iphone" || value === "android") return "mobile"
  if (value === "ipad" || value === "android_tablet") return "tablet"
  return "desktop"
}

export function buildSimulationCreateRequest(
  values: SimulationSetupDraftValues
): BackendSimulationCreateRequest {
  const request: BackendSimulationCreateRequest = {
    title: values.projectTitle.trim(),
    targetUrl: values.targetUrl.trim(),
    personaCount: values.personaCount,
    digitalLiteracy: values.digitalLiteracy,
    successCondition: values.successCondition.trim(),
    personaDevice: mapPersonaDeviceToBackend(values.personaDevice),
    ageRatioTeen: Math.round(values.ageRatios.teen),
    ageRatioFifty: Math.round(values.ageRatios.fifty),
    ageRatioEighty: Math.round(values.ageRatios.eighty),
  }

  if (values.visionImpairment !== null) {
    request.visionImpairment = values.visionImpairment
  }

  if (values.attentionLevel !== null) {
    request.attentionLevel = values.attentionLevel
  }

  return request
}

export function validateSimulationCreateRequest(request: BackendSimulationCreateRequest) {
  if (!request.title) return "title is required"
  if (!request.targetUrl) return "targetUrl is required"
  if (!request.successCondition) return "successCondition is required"
  if (request.personaCount < 1) return "personaCount must be at least 1"

  const ageRatioSum = request.ageRatioTeen + request.ageRatioFifty + request.ageRatioEighty
  if (ageRatioSum !== 100) return "age ratio sum must equal 100"

  const validLiteracy = ["high", "medium", "low"]
  if (!validLiteracy.includes(request.digitalLiteracy)) {
    return "digitalLiteracy must be high, medium, or low"
  }

  const validDevices = ["desktop", "mobile", "tablet"]
  if (!validDevices.includes(request.personaDevice)) {
    return "personaDevice must be desktop, mobile, or tablet"
  }

  const ratioValues = [request.ageRatioTeen, request.ageRatioFifty, request.ageRatioEighty]
  if (ratioValues.some((value) => value < 0 || value > 100)) {
    return "age ratios must be between 0 and 100"
  }

  if (
    request.visionImpairment !== undefined &&
    (request.visionImpairment < 0 || request.visionImpairment > 100)
  ) {
    return "visionImpairment must be between 0 and 100"
  }

  if (
    request.attentionLevel !== undefined &&
    (request.attentionLevel < 0 || request.attentionLevel > 100)
  ) {
    return "attentionLevel must be between 0 and 100"
  }

  return null
}
