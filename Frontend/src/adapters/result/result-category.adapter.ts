export function adaptIssueCategory(category: string) {
  const normalized = category.trim().toLowerCase()

  if (normalized === "접근성" || normalized === "accessibility") {
    return "접근성"
  }

  if (normalized === "사용성" || normalized === "usability") {
    return "사용성"
  }

  if (
    normalized === "시각요소" ||
    normalized === "visual" ||
    normalized === "visual_design"
  ) {
    return "시각요소"
  }

  return "기타"
}
