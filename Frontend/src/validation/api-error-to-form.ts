import type { ApiServiceError } from "@/services/core/api-service-error"
import type { SimulationSetupValidationErrors } from "@/validation/simulation-setup"

const FIELD_PATH_TO_FORM_KEY: Record<string, keyof SimulationSetupValidationErrors> = {
  title: "projectTitle",
  projectTitle: "projectTitle",
  targetUrl: "targetUrl",
  endUrl: "endUrl",
  successCondition: "successCondition",
  digitalLiteracy: "digitalLiteracy",
  personaDevice: "personaDevice",
  ageCount10: "ageCounts",
  ageCount20: "ageCounts",
  ageCount30: "ageCounts",
  ageCount40: "ageCounts",
  ageCount50: "ageCounts",
  ageCount60: "ageCounts",
  ageCount70: "ageCounts",
  visionImpairment: "visionImpairment",
  attentionLevel: "attentionLevel",
}

function normalizeFieldPath(path: string) {
  const segments = path.split(".")
  return segments[segments.length - 1] ?? path
}

export function mapApiErrorToSimulationSetupFormErrors(
  error: ApiServiceError
): SimulationSetupValidationErrors {
  const nextErrors: SimulationSetupValidationErrors = {}

  error.fieldErrors?.forEach((fieldError) => {
    const formKey = FIELD_PATH_TO_FORM_KEY[normalizeFieldPath(fieldError.path)]
    if (!formKey || nextErrors[formKey]) return
    nextErrors[formKey] = fieldError.message
  })

  return nextErrors
}
