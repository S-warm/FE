import { ApiServiceError } from "@/services/core/api-service-error"
import type { ApiFieldErrorResponse } from "@/types/api/common/api-error"
import type { SimulationSetupValidationErrors } from "@/validation/simulation-setup"

const UNKNOWN_SUBMIT_ERROR =
  "\uc2dc\ubbac\ub808\uc774\uc158 \uc0dd\uc131 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574\uc8fc\uc138\uc694."

const FIELD_ALIASES = {
  projectTitle: ["projectTitle", "title", "project-title"],
  targetUrl: ["targetUrl", "startUrl", "url", "target-url", "start-url"],
  endUrl: ["endUrl", "end-url"],
  successCondition: ["successCondition", "success-condition"],
  digitalLiteracy: ["digitalLiteracy", "literacy", "digital-literacy"],
  personaDevice: ["personaDevice", "device", "persona-device"],
  ageCounts: [
    "ageCounts",
    "ageCount10",
    "ageCount20",
    "ageCount30",
    "ageCount40",
    "ageCount50",
    "ageCount60",
    "ageCount70",
    "teens",
    "twenties",
    "thirties",
    "forties",
    "fifties",
    "sixties",
    "seventies",
    "age-counts",
  ],
  visionImpairment: ["visionImpairment", "visionLoss", "vision-impairment"],
  attentionLevel: ["attentionLevel", "attention-level"],
} as const

type SimulationFieldKey = Exclude<
  keyof SimulationSetupValidationErrors,
  "submitError"
>

function normalizeToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
}

function resolveFieldKey(value: string): SimulationFieldKey | undefined {
  const normalized = normalizeToken(value)

  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as Array<
    [SimulationFieldKey, readonly string[]]
  >) {
    if (aliases.some((alias) => normalizeToken(alias) === normalized)) {
      return field
    }
  }

  return undefined
}

function extractFieldKeyFromText(value: string): SimulationFieldKey | undefined {
  const tokens = value
    .split(/[\s,:[\]{}()/\\]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  for (const token of tokens) {
    const resolved = resolveFieldKey(token)
    if (resolved) {
      return resolved
    }
  }

  return undefined
}

function appendFieldError(
  errors: SimulationSetupValidationErrors,
  field: SimulationFieldKey,
  message: string,
) {
  if (!errors[field]) {
    errors[field] = message
  }
}

function mapFieldErrorEntries(
  entries: ApiFieldErrorResponse[],
  errors: SimulationSetupValidationErrors,
) {
  for (const entry of entries) {
    const field =
      (entry.field && resolveFieldKey(entry.field)) ||
      (entry.path && extractFieldKeyFromText(entry.path)) ||
      extractFieldKeyFromText(entry.message)

    if (field) {
      appendFieldError(errors, field, entry.message)
    }
  }
}

function mapPathAndMessage(
  path: string,
  message: string,
  errors: SimulationSetupValidationErrors,
) {
  const fieldFromPath = extractFieldKeyFromText(path)
  if (fieldFromPath) {
    appendFieldError(errors, fieldFromPath, message)
    return
  }

  const fieldFromMessage = extractFieldKeyFromText(message)
  if (fieldFromMessage) {
    appendFieldError(errors, fieldFromMessage, message)
  }
}

function hasInlineFieldErrors(errors: SimulationSetupValidationErrors) {
  return Object.entries(errors).some(
    ([key, value]) => key !== "submitError" && Boolean(value),
  )
}

export function mapApiErrorToSimulationSetupErrors(
  error: unknown,
): SimulationSetupValidationErrors {
  const mapped: SimulationSetupValidationErrors = {}

  if (error instanceof ApiServiceError) {
    if (Array.isArray(error.fieldErrors) && error.fieldErrors.length > 0) {
      mapFieldErrorEntries(error.fieldErrors, mapped)
    }

    mapPathAndMessage(error.path, error.message, mapped)

    if (!hasInlineFieldErrors(mapped)) {
      mapped.submitError = error.message || UNKNOWN_SUBMIT_ERROR
    }

    return mapped
  }

  if (error && typeof error === "object") {
    const candidate = error as Partial<{
      message: string
      path: string
      fieldErrors: ApiFieldErrorResponse[]
    }>

    if (Array.isArray(candidate.fieldErrors) && candidate.fieldErrors.length > 0) {
      mapFieldErrorEntries(candidate.fieldErrors, mapped)
    }

    if (candidate.path || candidate.message) {
      mapPathAndMessage(candidate.path ?? "", candidate.message ?? "", mapped)
    }
  }

  if (!hasInlineFieldErrors(mapped)) {
    mapped.submitError =
      error instanceof Error && error.message
        ? error.message
        : UNKNOWN_SUBMIT_ERROR
  }

  return mapped
}
