import mockScreenshot from "@/assets/mocks/mock-page-screenshot-photo.svg"

export interface ResultPageSummary {
  id: string
  name: string
  screenshotUrl: string
}

export const resultPagesMock: ResultPageSummary[] = [
  { id: "login", name: "로그인 페이지", screenshotUrl: mockScreenshot },
  { id: "main", name: "메인 페이지", screenshotUrl: mockScreenshot },
  { id: "signup", name: "회원가입 페이지", screenshotUrl: mockScreenshot },
  { id: "payment", name: "결제 페이지", screenshotUrl: mockScreenshot },
]

export const defaultResultPageId = resultPagesMock[0]?.id ?? "login"
