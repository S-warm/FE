import type { ApiIssueSeverity, ApiWcagSeverity } from "@/types/api/common/enums"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

function normalizeIssueSeverity(severity: unknown): ApiIssueSeverity {
  const normalized = String(severity).trim().toUpperCase()

  if (normalized === "CRITICAL") return "CRITICAL"
  if (normalized === "HIGH") return "HIGH"
  if (normalized === "MEDIUM") return "MEDIUM"
  return "LOW"
}

function normalizeWcagSeverity(severity: unknown): ApiWcagSeverity {
  const normalized = String(severity).trim().toLowerCase()

  if (normalized === "critical") return "Critical"
  if (normalized === "moderate") return "Moderate"
  return "Minor"
}

export function adaptIssueSeverity(severity: unknown): SeverityTokenViewModel {
  const normalized = normalizeIssueSeverity(severity)

  switch (normalized) {
    case "CRITICAL":
      return { raw: normalized, tone: "error", label: "치명", rank: 4 }
    case "HIGH":
      return { raw: normalized, tone: "error", label: "높음", rank: 3 }
    case "MEDIUM":
      return { raw: normalized, tone: "warning", label: "중간", rank: 2 }
    case "LOW":
    default:
      return { raw: normalized, tone: "info", label: "낮음", rank: 1 }
  }
}

export function adaptWcagSeverity(severity: unknown): SeverityTokenViewModel {
  const normalized = normalizeWcagSeverity(severity)

  switch (normalized) {
    case "Critical":
      return { raw: normalized, tone: "error", label: "치명", rank: 3 }
    case "Moderate":
      return { raw: normalized, tone: "warning", label: "보통", rank: 2 }
    case "Minor":
    default:
      return { raw: normalized, tone: "info", label: "경미", rank: 1 }
  }
}
