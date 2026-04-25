import type { IssueCategory } from "@/mocks/result-issues.mock"

export const filterCategories: IssueCategory[] = ["접근성", "사용성", "시각요소", "기타"]

export const categoryColorMap: Record<IssueCategory, string> = {
  접근성: "var(--color-category-a11y)",
  시각요소: "var(--color-category-visual)",
  사용성: "var(--color-category-usability)",
  기타: "var(--color-category-etc)",
}
