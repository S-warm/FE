import type { ApiIssueSeverity, ApiWcagSeverity } from "@/types/api/common/enums"
import type { SeverityTokenViewModel } from "@/types/view-model/common/severity"

export function adaptIssueSeverity(severity: ApiIssueSeverity): SeverityTokenViewModel {
  switch (severity) {
    case "CRITICAL":
      return { raw: severity, tone: "error", label: "치명적", rank: 4 }
    case "HIGH":
      return { raw: severity, tone: "error", label: "높음", rank: 3 }
    case "MEDIUM":
      return { raw: severity, tone: "warning", label: "중간", rank: 2 }
    case "LOW":
    default:
      return { raw: severity, tone: "info", label: "낮음", rank: 1 }
  }
}

export function adaptWcagSeverity(severity: ApiWcagSeverity): SeverityTokenViewModel {
  switch (severity) {
    case "Critical":
      return { raw: severity, tone: "error", label: "치명적", rank: 3 }
    case "Moderate":
      return { raw: severity, tone: "warning", label: "보통", rank: 2 }
    case "Minor":
    default:
      return { raw: severity, tone: "info", label: "경미", rank: 1 }
  }
}
