const AGE_BAND_COLORS: Record<string, { primary: string; muted: string; success: string; failure: string }> = {
  "10대": { primary: "#C1C9EE", muted: "#E7EAF8", success: "#C8E6C9", failure: "#FED7AA" },
  "20대": { primary: "#97A6E3", muted: "#DDE2F5", success: "#A5D6A7", failure: "#FDBA74" },
  "30대": { primary: "#6B84D8", muted: "#C3CBE0", success: "#81C784", failure: "#FB923C" },
  "40대": { primary: "#4669D0", muted: "#C3CBE0", success: "#66BB6A", failure: "#F97316" },
  "50대": { primary: "#3D559A", muted: "#C1C9EE", success: "#4CAF50", failure: "#EA580C" },
  "60대": { primary: "#374D91", muted: "#C1C9EE", success: "#43A047", failure: "#C2410C" },
  "70대": { primary: "#273A79", muted: "#9DA9CB", success: "#388E3C", failure: "#9A3412" },
  "80대": { primary: "#1E2F63", muted: "#9DA9CB", success: "#2E7D32", failure: "#7C2D12" },
}

function getAgeBandColor(ageBand: string, variant: "primary" | "muted" | "success" | "failure" = "primary"): string {
  return AGE_BAND_COLORS[ageBand]?.[variant] ?? (variant === "primary" ? "#94a3b8" : variant === "failure" ? "#FF9800" : "#e2e8f0")
}

export { AGE_BAND_COLORS, getAgeBandColor }
