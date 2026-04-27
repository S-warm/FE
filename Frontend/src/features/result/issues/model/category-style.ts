const CATEGORY_COLOR_BY_NAME: Record<string, string> = {
  접근성: "var(--color-category-a11y)",
  사용성: "var(--color-category-usability)",
  시각요소: "var(--color-category-visual)",
  기타: "var(--color-category-etc)",
}

const CATEGORY_PRIORITY_BY_NAME: Record<string, number> = {
  접근성: 0,
  사용성: 1,
  시각요소: 2,
  기타: 3,
}

export function getCategoryColor(category: string) {
  return CATEGORY_COLOR_BY_NAME[category] ?? "var(--color-category-etc)"
}

export function sortCategories(categories: string[]) {
  return [...categories].sort((left, right) => {
    const leftPriority = CATEGORY_PRIORITY_BY_NAME[left] ?? Number.MAX_SAFE_INTEGER
    const rightPriority = CATEGORY_PRIORITY_BY_NAME[right] ?? Number.MAX_SAFE_INTEGER

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    return left.localeCompare(right, "ko")
  })
}
