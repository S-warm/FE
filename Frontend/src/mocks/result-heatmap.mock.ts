export type HeatmapSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type AgeGroup = "10s" | "20s" | "30s" | "40s" | "50s" | "60s" | "70s"

export interface HeatmapPoint {
  issueId: string
  url: string
  x: number
  y: number
  ageBand: AgeGroup
  count: number
  severity: HeatmapSeverity
  errorType: string
}

export interface HeatmapAggregation {
  errorPoints: HeatmapPoint[]
}

/**
 * 네이버 쇼핑몰 구매 플로우 히트맵 마커 위치
 * 각 페이지별 주요 상호작용 포인트에 마커 배치
 *
 * 플로우: 로그인 → 회원가입 → 메인 → 검색 → 상품상세 → 장바구니
 */
export const heatmapMockData: HeatmapAggregation = {
  errorPoints: [
    // ============================================================================
    // 로그인 페이지 (https://a-mall.com/login)
    // 주요 상호작용: 로그인 버튼, 비밀번호 입력, ID 입력, SNS 로그인
    // ============================================================================
    // 로그인 버튼 (x: 중앙, y: 중간-하단)
    {
      issueId: "login_button_50s",
      url: "https://a-mall.com/login",
      x: 0.483,
      y: 0.534,
      ageBand: "50s" as const,
      count: 12,
      severity: "HIGH" as const,
      errorType: "사용성/로그인 버튼 시인성",
    },
    {
      issueId: "login_button_60s",
      url: "https://a-mall.com/login",
      x: 0.485,
      y: 0.534,
      ageBand: "60s" as const,
      count: 14,
      severity: "HIGH" as const,
      errorType: "사용성/로그인 버튼 시인성",
    },
    {
      issueId: "login_button_70s",
      url: "https://a-mall.com/login",
      x: 0.485,
      y: 0.534,
      ageBand: "70s" as const,
      count: 16,
      severity: "CRITICAL" as const,
      errorType: "사용성/로그인 버튼 시인성",
    },
    // 비밀번호 표시 토글 아이콘 (우측 상단)
    {
      issueId: "password_toggle_60s",
      url: "https://a-mall.com/login",
      x: 0.91,
      y: 0.465,
      ageBand: "60s" as const,
      count: 8,
      severity: "MEDIUM" as const,
      errorType: "접근성/아이콘 발견 어려움",
    },
    {
      issueId: "password_toggle_70s",
      url: "https://a-mall.com/login",
      x: 0.91,
      y: 0.465,
      ageBand: "70s" as const,
      count: 10,
      severity: "HIGH" as const,
      errorType: "접근성/아이콘 발견 어려움",
    },
    // ID 입력 필드 placeholder (좌측 상단)
    {
      issueId: "id_placeholder_50s",
      url: "https://a-mall.com/login",
      x: 0.15,
      y: 0.391,
      ageBand: "50s" as const,
      count: 6,
      severity: "MEDIUM" as const,
      errorType: "시각요소/placeholder 대비",
    },

    // ============================================================================
    // 회원가입 페이지 (https://a-mall.com/signup)
    // 주요 상호작용: 이메일 입력, 인증번호, 비밀번호, 약관 동의, 가입 완료
    // ============================================================================
    // 필수 입력 필드 표시 (*) (상단)
    {
      issueId: "required_field_40s",
      url: "https://a-mall.com/signup",
      x: 0.92,
      y: 0.18,
      ageBand: "40s" as const,
      count: 7,
      severity: "MEDIUM" as const,
      errorType: "접근성/필수 표시 부족",
    },
    {
      issueId: "required_field_50s",
      url: "https://a-mall.com/signup",
      x: 0.92,
      y: 0.18,
      ageBand: "50s" as const,
      count: 9,
      severity: "HIGH" as const,
      errorType: "접근성/필수 표시 부족",
    },
    // 인증번호 입력 박스 (중앙-상단)
    {
      issueId: "auth_number_50s",
      url: "https://a-mall.com/signup",
      x: 0.5,
      y: 0.32,
      ageBand: "50s" as const,
      count: 5,
      severity: "MEDIUM" as const,
      errorType: "접근성/포커스 이동 불안정",
    },
    {
      issueId: "auth_number_60s",
      url: "https://a-mall.com/signup",
      x: 0.5,
      y: 0.32,
      ageBand: "60s" as const,
      count: 7,
      severity: "HIGH" as const,
      errorType: "접근성/포커스 이동 불안정",
    },
    // 약관 동의 체크박스 (좌측-하단)
    {
      issueId: "terms_checkbox_30s",
      url: "https://a-mall.com/signup",
      x: 0.05,
      y: 0.76,
      ageBand: "30s" as const,
      count: 4,
      severity: "LOW" as const,
      errorType: "접근성/클릭 영역 부족",
    },
    // 가입 완료 버튼 (우측-하단)
    {
      issueId: "signup_button_20s",
      url: "https://a-mall.com/signup",
      x: 0.95,
      y: 0.9,
      ageBand: "20s" as const,
      count: 2,
      severity: "LOW" as const,
      errorType: "사용성/버튼 위치",
    },

    // ============================================================================
    // 메인 페이지 (https://a-mall.com/main)
    // 주요 상호작용: 히어로 CTA, 카테고리 메뉴, 상품 카드, 배너 슬라이드
    // ============================================================================
    // 히어로 배너 CTA 버튼 (중앙-상단)
    {
      issueId: "hero_cta_30s",
      url: "https://a-mall.com/main",
      x: 0.5,
      y: 0.22,
      ageBand: "30s" as const,
      count: 3,
      severity: "MEDIUM" as const,
      errorType: "시각요소/대비 부족",
    },
    {
      issueId: "hero_cta_40s",
      url: "https://a-mall.com/main",
      x: 0.5,
      y: 0.22,
      ageBand: "40s" as const,
      count: 5,
      severity: "MEDIUM" as const,
      errorType: "시각요소/대비 부족",
    },
    // 상단 카테고리 메뉴 (좌측)
    {
      issueId: "category_menu_40s",
      url: "https://a-mall.com/main",
      x: 0.12,
      y: 0.08,
      ageBand: "40s" as const,
      count: 6,
      severity: "HIGH" as const,
      errorType: "접근성/호버 의존",
    },
    {
      issueId: "category_menu_50s",
      url: "https://a-mall.com/main",
      x: 0.12,
      y: 0.08,
      ageBand: "50s" as const,
      count: 8,
      severity: "HIGH" as const,
      errorType: "접근성/호버 의존",
    },
    // 상품 카드 영역 (중앙)
    {
      issueId: "product_card_50s",
      url: "https://a-mall.com/main",
      x: 0.5,
      y: 0.5,
      ageBand: "50s" as const,
      count: 4,
      severity: "LOW" as const,
      errorType: "시각요소/가격 가독성",
    },
    // 배너 슬라이드 제어 버튼 (우측)
    {
      issueId: "banner_control_30s",
      url: "https://a-mall.com/main",
      x: 0.92,
      y: 0.2,
      ageBand: "30s" as const,
      count: 2,
      severity: "LOW" as const,
      errorType: "접근성/일시 정지 미지원",
    },

    // ============================================================================
    // 검색 페이지 (https://a-mall.com/search)
    // 주요 상호작용: 검색창, 필터, 정렬, 페이지네이션, 상품 리스트
    // ============================================================================
    // 검색창 입력 필드 (상단-중앙)
    {
      issueId: "search_input_40s",
      url: "https://a-mall.com/search",
      x: 0.5,
      y: 0.08,
      ageBand: "40s" as const,
      count: 5,
      severity: "MEDIUM" as const,
      errorType: "접근성/포커스 표시 약함",
    },
    {
      issueId: "search_input_50s",
      url: "https://a-mall.com/search",
      x: 0.5,
      y: 0.08,
      ageBand: "50s" as const,
      count: 7,
      severity: "HIGH" as const,
      errorType: "접근성/포커스 표시 약함",
    },
    // 좌측 필터 영역 (좌측-중앙)
    {
      issueId: "filter_checkbox_20s",
      url: "https://a-mall.com/search",
      x: 0.08,
      y: 0.35,
      ageBand: "20s" as const,
      count: 3,
      severity: "LOW" as const,
      errorType: "시각요소/체크박스 대비",
    },
    {
      issueId: "filter_checkbox_30s",
      url: "https://a-mall.com/search",
      x: 0.08,
      y: 0.35,
      ageBand: "30s" as const,
      count: 4,
      severity: "MEDIUM" as const,
      errorType: "시각요소/체크박스 대비",
    },
    // 검색 결과 카드 (중앙)
    {
      issueId: "result_card_30s",
      url: "https://a-mall.com/search",
      x: 0.5,
      y: 0.45,
      ageBand: "30s" as const,
      count: 6,
      severity: "MEDIUM" as const,
      errorType: "시각요소/카드 구분 부족",
    },
    {
      issueId: "result_card_40s",
      url: "https://a-mall.com/search",
      x: 0.5,
      y: 0.45,
      ageBand: "40s" as const,
      count: 7,
      severity: "MEDIUM" as const,
      errorType: "시각요소/카드 구분 부족",
    },
    // 페이지네이션 (하단-중앙)
    {
      issueId: "pagination_40s",
      url: "https://a-mall.com/search",
      x: 0.5,
      y: 0.92,
      ageBand: "40s" as const,
      count: 5,
      severity: "MEDIUM" as const,
      errorType: "접근성/터치 영역 미달",
    },
    {
      issueId: "pagination_50s",
      url: "https://a-mall.com/search",
      x: 0.5,
      y: 0.92,
      ageBand: "50s" as const,
      count: 6,
      severity: "MEDIUM" as const,
      errorType: "접근성/터치 영역 미달",
    },

    // ============================================================================
    // 상품 상세 페이지 (https://a-mall.com/product/12847)
    // 주요 상호작용: 상품 이미지, 옵션 선택, 리뷰, 장바구니 버튼
    // ============================================================================
    // 상품 이미지 (좌측-상단)
    {
      issueId: "product_image_30s",
      url: "https://a-mall.com/product/12847",
      x: 0.25,
      y: 0.3,
      ageBand: "30s" as const,
      count: 2,
      severity: "LOW" as const,
      errorType: "접근성/이미지 확대 버튼",
    },
    // 옵션 선택 드롭다운 (우측-상단)
    {
      issueId: "option_dropdown_40s",
      url: "https://a-mall.com/product/12847",
      x: 0.75,
      y: 0.25,
      ageBand: "40s" as const,
      count: 4,
      severity: "MEDIUM" as const,
      errorType: "접근성/터치 영역 부족",
    },
    {
      issueId: "option_dropdown_50s",
      url: "https://a-mall.com/product/12847",
      x: 0.75,
      y: 0.25,
      ageBand: "50s" as const,
      count: 5,
      severity: "MEDIUM" as const,
      errorType: "접근성/터치 영역 부족",
    },
    // 리뷰 별점 (중앙)
    {
      issueId: "review_rating_20s",
      url: "https://a-mall.com/product/12847",
      x: 0.75,
      y: 0.5,
      ageBand: "20s" as const,
      count: 2,
      severity: "LOW" as const,
      errorType: "시각요소/별점 색상 의존",
    },
    // 장바구니 추가 버튼 (우측-하단)
    {
      issueId: "add_to_cart_20s",
      url: "https://a-mall.com/product/12847",
      x: 0.85,
      y: 0.85,
      ageBand: "20s" as const,
      count: 1,
      severity: "LOW" as const,
      errorType: "사용성/버튼 위치 비표준",
    },
    {
      issueId: "add_to_cart_30s",
      url: "https://a-mall.com/product/12847",
      x: 0.85,
      y: 0.85,
      ageBand: "30s" as const,
      count: 2,
      severity: "LOW" as const,
      errorType: "사용성/버튼 위치 비표준",
    },

    // ============================================================================
    // 장바구니 페이지 (https://a-mall.com/cart)
    // 주요 상호작용: 수량 조절, 삭제 버튼, 쿠폰, 주문하기
    // ============================================================================
    // 수량 조절 버튼 (좌측-중앙)
    {
      issueId: "qty_button_40s",
      url: "https://a-mall.com/cart",
      x: 0.08,
      y: 0.4,
      ageBand: "40s" as const,
      count: 6,
      severity: "HIGH" as const,
      errorType: "접근성/터치 영역 미달",
    },
    {
      issueId: "qty_button_50s",
      url: "https://a-mall.com/cart",
      x: 0.08,
      y: 0.4,
      ageBand: "50s" as const,
      count: 8,
      severity: "HIGH" as const,
      errorType: "접근성/터치 영역 미달",
    },
    // 삭제 아이콘 (우측)
    {
      issueId: "delete_button_30s",
      url: "https://a-mall.com/cart",
      x: 0.92,
      y: 0.4,
      ageBand: "30s" as const,
      count: 3,
      severity: "HIGH" as const,
      errorType: "사용성/삭제 확인 미지원",
    },
    // 쿠폰 입력 영역 (중앙-상단)
    {
      issueId: "coupon_input_30s",
      url: "https://a-mall.com/cart",
      x: 0.5,
      y: 0.15,
      ageBand: "30s" as const,
      count: 4,
      severity: "MEDIUM" as const,
      errorType: "접근성/아코디언 발견 어려움",
    },
    // 총 금액 표시 (우측-중앙)
    {
      issueId: "total_amount_20s",
      url: "https://a-mall.com/cart",
      x: 0.85,
      y: 0.55,
      ageBand: "20s" as const,
      count: 1,
      severity: "LOW" as const,
      errorType: "시각요소/위계 부재",
    },
    // 주문하기 버튼 (우측-하단)
    {
      issueId: "checkout_button_20s",
      url: "https://a-mall.com/cart",
      x: 0.85,
      y: 0.9,
      ageBand: "20s" as const,
      count: 1,
      severity: "LOW" as const,
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "checkout_button_30s",
      url: "https://a-mall.com/cart",
      x: 0.85,
      y: 0.9,
      ageBand: "30s" as const,
      count: 2,
      severity: "LOW" as const,
      errorType: "사용성/버튼 위치",
    },
  ]
}
