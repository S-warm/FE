import type { ApiPersonaDevice } from "@/types/api/common/enums"
import type { SimulationCreateRequestDto } from "@/types/api/simulation/simulation-create.request"
import type {
  SimulationFormAgeCounts,
  SimulationFormPersonaDevice,
  SimulationFormViewModel,
} from "@/types/view-model/simulation/simulation-form"

export function mapSimulationFormPersonaDeviceToApiDevice(
  device: SimulationFormPersonaDevice
): ApiPersonaDevice {
  if (device === "mac" || device === "windows") return "desktop"
  if (device === "iphone" || device === "android") return "mobile"
  return "tablet"
}

export function getSimulationFormTotalPersonaCount(ageCounts: SimulationFormAgeCounts): number {
  return Object.values(ageCounts).reduce((sum, count) => sum + count, 0)
}

export function mapSimulationFormToCreateRequest(
  form: SimulationFormViewModel
): SimulationCreateRequestDto {
  return {
    title: form.projectTitle.trim(),
    targetUrl: form.targetUrl.trim(),
    digitalLiteracy: form.digitalLiteracy,
    successCondition: form.successCondition.trim(),
    personaDevice: mapSimulationFormPersonaDeviceToApiDevice(form.personaDevice),
    ageCount10: form.ageCounts.teens,
    ageCount20: form.ageCounts.twenties,
    ageCount30: form.ageCounts.thirties,
    ageCount40: form.ageCounts.forties,
    ageCount50: form.ageCounts.fifties,
    ageCount60: form.ageCounts.sixties,
    ageCount70: form.ageCounts.seventies,
    visionImpairment: form.visionImpairment,
    attentionLevel: form.attentionLevel,
  }
}
