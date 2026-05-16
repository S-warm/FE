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

function normalizeUrlSearchParams(rawValue: string) {
  const trimmedValue = rawValue.trim()
  if (!trimmedValue) {
    return new URLSearchParams()
  }

  const normalizedValue = trimmedValue.startsWith("?")
    ? trimmedValue.slice(1)
    : trimmedValue

  return new URLSearchParams(normalizedValue)
}

function buildSuccessCondition(endUrl: string, urlParams: string) {
  const parsedEndUrl = new URL(endUrl.trim())
  const mergedParams = new URLSearchParams(parsedEndUrl.search)
  const manualParams = normalizeUrlSearchParams(urlParams)

  manualParams.forEach((value, key) => {
    mergedParams.set(key, value)
  })

  return {
    path: parsedEndUrl.pathname || "/",
    requiredParams: Object.fromEntries(mergedParams.entries()),
  }
}

export function mapSimulationFormToCreateRequest(
  form: SimulationFormViewModel,
  urlParams = ""
): SimulationCreateRequestDto {
  return {
    title: form.projectTitle.trim(),
    task: form.successCondition.trim(),
    targetUrl: form.targetUrl.trim(),
    digitalLiteracy: form.digitalLiteracy,
    successCondition: buildSuccessCondition(form.endUrl, urlParams),
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
