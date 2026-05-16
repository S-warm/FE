export interface ResultPageSummary {
  id: string
  name: string
  screenshotUrl: string
}

export const resultPagesMock: ResultPageSummary[] = [
  { id: "login", name: "로그인 페이지", screenshotUrl: "/mock-images/page-login.png" },
  { id: "main", name: "메인 페이지", screenshotUrl: "/mock-images/page-main.png" },
  { id: "signup", name: "회원가입 페이지", screenshotUrl: "/mock-images/page-signup.png" },
  { id: "search", name: "검색 페이지", screenshotUrl: "/mock-images/page-search.png" },
  { id: "product", name: "상품 상세 페이지", screenshotUrl: "/mock-images/page-product-detail.png" },
  { id: "cart", name: "장바구니 페이지", screenshotUrl: "/mock-images/page-cart.png" },
]

export const defaultResultPageId = resultPagesMock[0]?.id ?? "login"
