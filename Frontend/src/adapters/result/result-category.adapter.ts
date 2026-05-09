export function adaptIssueCategory(category: string) {
  const normalized = category.trim().toLowerCase()

  if (normalized === "accessibility") return "접근성"
  if (normalized === "usability") return "사용성"
  if (normalized === "visual" || normalized === "visual_design") return "시각요소"

  return "기타"
}
