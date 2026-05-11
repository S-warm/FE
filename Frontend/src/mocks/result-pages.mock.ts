import { resultMasterPages } from "@/mocks/result-master.mock"

export interface ResultPageSummary {
  id: string
  name: string
  screenshotUrl: string
}

export const resultPagesMock: ResultPageSummary[] = resultMasterPages.map((page) => ({
  id: page.id,
  name: page.name,
  screenshotUrl: page.screenshotUrl,
}))

export const defaultResultPageId = resultPagesMock[0]?.id ?? "login"
