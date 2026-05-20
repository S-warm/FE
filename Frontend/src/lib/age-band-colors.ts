const AGE_BAND_COLORS: Record<string, { primary: string; muted: string }> = {
  "10대": { primary: "#C1C9EE", muted: "#E7EAF8" },
  "20대": { primary: "#97A6E3", muted: "#DDE2F5" },
  "30대": { primary: "#6B84D8", muted: "#C3CBE0" },
  "40대": { primary: "#4669D0", muted: "#C3CBE0" },
  "50대": { primary: "#3D559A", muted: "#C1C9EE" },
  "60대": { primary: "#374D91", muted: "#C1C9EE" },
  "70대": { primary: "#273A79", muted: "#9DA9CB" },
  "80대": { primary: "#1E2F63", muted: "#9DA9CB" },
}

function getAgeBandColor(ageBand: string, variant: "primary" | "muted" = "primary"): string {
  return AGE_BAND_COLORS[ageBand]?.[variant] ?? (variant === "primary" ? "#94a3b8" : "#e2e8f0")
}

export { AGE_BAND_COLORS, getAgeBandColor }
