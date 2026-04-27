import { resultIssuePages } from "@/mocks/result-issues.mock"
import { resultPagesMock } from "@/mocks/result-pages.mock"
import type { ResultPageSummary } from "@/shared/types/result"

export const defaultResultPageId = resultPagesMock[0]?.id ?? "login"

export function isKnownResultPageId(value: string | null) {
  if (!value) return false
  return resultPagesMock.some((page) => page.id === value)
}

export function resolveResultPageId(value: string | null): string {
  if (!value) return defaultResultPageId
  return value
}

export function getResultPages(): ResultPageSummary[] {
  return resultPagesMock
}

export function getIssueCountByPageId(pageId: string) {
  return resultIssuePages.find((item) => item.id === pageId)?.issues.length ?? 0
}
