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
  submitError?: string
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
  form: SimulationFormViewModel,
): SimulationSetupValidationErrors {
  const errors: SimulationSetupValidationErrors = {}

  if (!form.projectTitle.trim()) {
    errors.projectTitle = "\ud504\ub85c\uc81d\ud2b8 \uc81c\ubaa9\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694."
  }

  if (!form.targetUrl.trim()) {
    errors.targetUrl = "\uc2dc\uc791 URL\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694."
  } else if (!isValidHttpUrl(form.targetUrl.trim())) {
    errors.targetUrl = "\uc62c\ubc14\ub978 URL \ud615\uc2dd\uc73c\ub85c \uc785\ub825\ud574\uc8fc\uc138\uc694."
  }

  if (!form.endUrl.trim()) {
    errors.endUrl = "\uc885\ub8cc URL\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694."
  } else if (!isValidHttpUrl(form.endUrl.trim())) {
    errors.endUrl = "\uc62c\ubc14\ub978 URL \ud615\uc2dd\uc73c\ub85c \uc785\ub825\ud574\uc8fc\uc138\uc694."
  }

  if (!form.successCondition.trim()) {
    errors.successCondition = "\uc131\uacf5 \uc870\uac74\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694."
  }

  if (!DIGITAL_LITERACY_VALUES.includes(form.digitalLiteracy)) {
    errors.digitalLiteracy = "\ub514\uc9c0\ud138 \ub9ac\ud130\ub7ec\uc2dc\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694."
  }

  if (!PERSONA_DEVICE_VALUES.includes(form.personaDevice)) {
    errors.personaDevice = "\ub514\ubc14\uc774\uc2a4\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694."
  }

  const ageValues = Object.values(form.ageCounts)
  const hasInvalidAgeCount = ageValues.some((count) => !isSafeInteger(count) || count < 0)
  const totalAgeCount = ageValues.reduce((sum, count) => sum + count, 0)

  if (hasInvalidAgeCount) {
    errors.ageCounts =
      "\uc5f0\ub839\ub300\ubcc4 \ud398\ub974\uc18c\ub098 \uc218\ub294 0 \uc774\uc0c1\uc758 \uc815\uc218\uc5ec\uc57c \ud569\ub2c8\ub2e4."
  } else if (totalAgeCount <= 0) {
    errors.ageCounts =
      "\ucd5c\uc18c 1\uba85 \uc774\uc0c1\uc758 \ud398\ub974\uc18c\ub098\ub97c \uc124\uc815\ud574\uc8fc\uc138\uc694."
  }

  if (
    !isSafeInteger(form.visionImpairment) ||
    form.visionImpairment < 0 ||
    form.visionImpairment > 100
  ) {
    errors.visionImpairment =
      "\uc2dc\ub825 \uc800\ud558 \uac12\uc740 0~100 \uc0ac\uc774\uc5ec\uc57c \ud569\ub2c8\ub2e4."
  }

  if (
    !isSafeInteger(form.attentionLevel) ||
    form.attentionLevel < 0 ||
    form.attentionLevel > 100
  ) {
    errors.attentionLevel =
      "\uc8fc\uc758\ub825 \uac12\uc740 0~100 \uc0ac\uc774\uc5ec\uc57c \ud569\ub2c8\ub2e4."
  }

  return errors
}

export function hasSimulationSetupValidationErrors(errors: SimulationSetupValidationErrors) {
  return Object.entries(errors).some(
    ([key, value]) => key !== "submitError" && Boolean(value),
  )
}
