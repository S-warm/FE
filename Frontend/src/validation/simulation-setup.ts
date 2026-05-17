import type {
  SimulationFormDigitalLiteracy,
  SimulationFormPersonaDevice,
  SimulationFormViewModel,
} from "@/types/view-model/simulation/simulation-form"

const DIGITAL_LITERACY_VALUES: SimulationFormDigitalLiteracy[] = ["high", "medium", "low"]
const PERSONA_DEVICE_VALUES: SimulationFormPersonaDevice[] = [
  "mac",
  "windows",
  "iphone",
  "android",
  "ipad",
  "android_tablet",
]

export interface SimulationSetupValidationErrors {
  projectTitle?: string
  targetUrl?: string
  endUrl?: string
  successCondition?: string
  digitalLiteracy?: string
  personaDevice?: string
  ageCounts?: string
  visionImpairment?: string
  attentionLevel?: string
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function isSafeInteger(value: number) {
  return Number.isInteger(value) && Number.isFinite(value)
}

export function validateSimulationSetupForm(
  form: SimulationFormViewModel
): SimulationSetupValidationErrors {
  const errors: SimulationSetupValidationErrors = {}

  if (!form.projectTitle.trim()) {
    errors.projectTitle = "프로젝트 제목을 입력해주세요."
  }

  if (!form.targetUrl.trim()) {
    errors.targetUrl = "시작 URL을 입력해주세요."
  } else if (!isValidHttpUrl(form.targetUrl.trim())) {
    errors.targetUrl = "올바른 URL 형식으로 입력해주세요."
  }

  if (!form.endUrl.trim()) {
    errors.endUrl = "종료 URL을 입력해주세요."
  } else if (!isValidHttpUrl(form.endUrl.trim())) {
    errors.endUrl = "올바른 URL 형식으로 입력해주세요."
  }

  if (!form.successCondition.trim()) {
    errors.successCondition = "성공 조건을 입력해주세요."
  }

  if (!DIGITAL_LITERACY_VALUES.includes(form.digitalLiteracy)) {
    errors.digitalLiteracy = "디지털 리터러시를 선택해주세요."
  }

  if (!PERSONA_DEVICE_VALUES.includes(form.personaDevice)) {
    errors.personaDevice = "디바이스를 선택해주세요."
  }

  const ageValues = Object.values(form.ageCounts)
  const hasInvalidAgeCount = ageValues.some((count) => !isSafeInteger(count) || count < 0)
  const totalAgeCount = ageValues.reduce((sum, count) => sum + count, 0)

  if (hasInvalidAgeCount) {
    errors.ageCounts = "연령대별 페르소나 수는 0 이상의 정수여야 합니다."
  } else if (totalAgeCount <= 0) {
    errors.ageCounts = "최소 1명 이상의 페르소나를 설정해주세요."
  }

  if (!isSafeInteger(form.visionImpairment) || form.visionImpairment < 0 || form.visionImpairment > 100) {
    errors.visionImpairment = "시력 저하 값은 0~100 사이여야 합니다."
  }

  if (!isSafeInteger(form.attentionLevel) || form.attentionLevel < 0 || form.attentionLevel > 100) {
    errors.attentionLevel = "주의력 값은 0~100 사이여야 합니다."
  }

  return errors
}

export function hasSimulationSetupValidationErrors(errors: SimulationSetupValidationErrors) {
  return Object.values(errors).some(Boolean)
}
