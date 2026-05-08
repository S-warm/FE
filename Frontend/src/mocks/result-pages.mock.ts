import { resultPageScreenshotUrl } from "@/mocks/mock-assets"

export interface ResultPageSummary {
  id: string
  name: string
  screenshotUrl: string
}

export const resultPagesMock: ResultPageSummary[] = [
  { id: "login", name: "로그인 페이지", screenshotUrl: resultPageScreenshotUrl },
  { id: "main", name: "메인 페이지", screenshotUrl: resultPageScreenshotUrl },
  { id: "signup", name: "회원가입 페이지", screenshotUrl: resultPageScreenshotUrl },
  { id: "payment", name: "결제 페이지", screenshotUrl: resultPageScreenshotUrl },
]

export const defaultResultPageId = resultPagesMock[0]?.id ?? "login"
