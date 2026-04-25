import mockScreenshot from "@/assets/mocks/img-example-site.png"
import type { ResultPageSummary } from "@/shared/types/result"

export const resultPagesMock: ResultPageSummary[] = [
  { id: "login", name: "로그인 페이지", screenshotUrl: mockScreenshot },
  { id: "main", name: "메인 페이지", screenshotUrl: mockScreenshot },
  { id: "signup", name: "회원가입 페이지", screenshotUrl: mockScreenshot },
  { id: "payment", name: "결제 페이지", screenshotUrl: mockScreenshot },
]
